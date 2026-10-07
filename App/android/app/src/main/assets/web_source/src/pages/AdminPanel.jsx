import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, addDoc, where } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, Activity, ScanFace, BarChart3, Edit, Trash2, Plus, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatsCard from '@/components/dashboard/StatsCard';
import { format, isValid } from 'date-fns';
import { Navigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useToast } from "@/components/ui/use-toast";

const conditionLabels = {
  acne: 'Acne', pimples: 'Pimples', dry_skin: 'Dry Skin',
  oily_skin: 'Oily Skin', dark_spots: 'Dark Spots', normal: 'Normal',
};

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))'
];

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);

  // Queries
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Admin: Users fetch error", err);
        return [];
      }
    },
    initialData: [],
  });

  const { data: analyses, isLoading: loadingAnalyses } = useQuery({
    queryKey: ['admin-analyses'],
    queryFn: async () => {
      try {
        const q = query(collection(db, "SkinAnalysis"), limit(200));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const docData = doc.data();
          let date = new Date(0);
          if (docData.created_at) {
            date = typeof docData.created_at.toDate === 'function' ? docData.created_at.toDate() : new Date(docData.created_at);
          }
          return {
            id: doc.id,
            ...docData,
            created_at: date
          };
        }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      } catch (err) {
        console.error("Admin: Analyses fetch error", err);
        return [];
      }
    },
    initialData: [],
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      try {
        const q = query(collection(db, "products"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Admin: Products fetch error", err);
        return [];
      }
    },
    initialData: [],
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ collectionName, id, data }) => {
      await updateDoc(doc(db, collectionName, id), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${variables.collectionName === 'SkinAnalysis' ? 'analyses' : 'products'}`] });
      toast({ title: "Successfully updated" });
      setEditingItem(null);
      setIsProductDialogOpen(false);
      setIsAnalysisDialogOpen(false);
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ collectionName, id }) => {
      await deleteDoc(doc(db, collectionName, id));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${variables.collectionName === 'SkinAnalysis' ? 'analyses' : 'products'}`] });
      toast({ title: "Deleted successfully" });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });

  const addProductMutation = useMutation({
    mutationFn: async (data) => {
      await addDoc(collection(db, "products"), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: "Product added" });
      setIsProductDialogOpen(false);
    }
  });

  const seedProductsMutation = useMutation({
    mutationFn: async () => {
      const fullProductSet = [
        // CLEANSERS (10)
        { name: "CeraVe Foaming Cleanser", type: "cleanser", condition: "oily_skin", description: "Removes oil without disrupting the barrier.", usage: "Twice daily." },
        { name: "LRP Effaclar Purifying Gel", type: "cleanser", condition: "acne", description: "Purifies oily skin with zinc pidolate.", usage: "Morning/Night." },
        { name: "Cetaphil Gentle Cleanser", type: "cleanser", condition: "dry_skin", description: "Mild, non-irritating formula.", usage: "Daily use." },
        { name: "COSRX Low pH Gel", type: "cleanser", condition: "oily_skin", description: "Gentle botanical ingredients.", usage: "Every morning." },
        { name: "Neutrogena Water Cleanser", type: "cleanser", condition: "dry_skin", description: "Hydrating Hyaluronic formula.", usage: "Twice daily." },
        { name: "Kiehl's Ultra Cleanser", type: "cleanser", condition: "normal", description: "pH-balanced gentle wash.", usage: "Daily." },
        { name: "Fresh Soy Cleanser", type: "cleanser", condition: "normal", description: "Amino acid-rich gentle wash.", usage: "Daily." },
        { name: "Bioderma Sensibio Gel", type: "cleanser", condition: "dry_skin", description: "Soothing for sensitive dry skin.", usage: "Twice daily." },
        { name: "PanOxyl Acne Wash", type: "cleanser", condition: "acne", description: "High-strength acne wash.", usage: "Once daily." },
        { name: "Paula's Choice Clear", type: "cleanser", condition: "acne", description: "Pore-cleansing formula.", usage: "Twice daily." },

        // MOISTURIZERS (10)
        { name: "Neutrogena Water Gel", type: "moisturizer", condition: "oily_skin", description: "Oil-free gel moisturizer.", usage: "Apply morning." },
        { name: "CeraVe Moisturizing Cream", type: "moisturizer", condition: "dry_skin", description: "Rich cream for intense hydration.", usage: "Apply liberally." },
        { name: "LRP Toleriane Double Repair", type: "moisturizer", condition: "normal", description: "Prebiotic skincare for barrier.", usage: "Twice daily." },
        { name: "Kiehl's Ultra Facial Cream", type: "moisturizer", condition: "normal", description: "24-hour daily hydration.", usage: "Morning/Night." },
        { name: "Clinique Dramatically Different", type: "moisturizer", condition: "oily_skin", description: "Oil-free hydration jelly.", usage: "Daily." },
        { name: "First Aid Ultra Repair", type: "moisturizer", condition: "dry_skin", description: "Intense hydration for dry skin.", usage: "Apply as needed." },
        { name: "Tatcha The Water Cream", type: "moisturizer", condition: "oily_skin", description: "Japanese nutrients formula.", usage: "Morning." },
        { name: "Belif Aqua Bomb", type: "moisturizer", condition: "oily_skin", description: "Instant burst of hydration.", usage: "Morning/Night." },
        { name: "Aveeno Oat Gel", type: "moisturizer", condition: "normal", description: "Soothing prebiotic oat formula.", usage: "Daily." },
        { name: "Weleda Skin Food", type: "moisturizer", condition: "dry_skin", description: "Intensive deep hydration.", usage: "Nightly." },

        // SERUMS (10)
        { name: "Ordinary Niacinamide", type: "serum", condition: "oily_skin", description: "Blemish and oil control.", usage: "Morning/Night." },
        { name: "SkinCeuticals C E Ferulic", type: "serum", condition: "dark_spots", description: "Patented antioxidant serum.", usage: "Every morning." },
        { name: "Ordinary Hyaluronic Acid", type: "serum", condition: "dry_skin", description: "Multi-weight hydration.", usage: "Morning/Night." },
        { name: "Paula's Choice 2% BHA", type: "serum", condition: "acne", description: "Salicylic acid exfoliant.", usage: "Nightly." },
        { name: "Kiehl's Dark Spot Serum", type: "serum", condition: "dark_spots", description: "Visibly fades pigmentation.", usage: "Spot treatment." },
        { name: "Sunday Riley Good Genes", type: "serum", condition: "dark_spots", description: "Lactic acid resurfacer.", usage: "Nightly." },
        { name: "Estée Lauder ANR", type: "serum", condition: "normal", description: "Advanced night repair.", usage: "Before bed." },
        { name: "Drunk Elephant C-Firma", type: "serum", condition: "dark_spots", description: "Potent vitamin C firming.", usage: "Morning." },
        { name: "Vichy Minéral 89", type: "serum", condition: "dry_skin", description: "Volcanic water booster.", usage: "Daily." },
        { name: "Glow Recipe Dew Drops", type: "serum", condition: "normal", description: "Niacinamide glow serum.", usage: "Morning." },

        // SUNSCREENS (10)
        { name: "EltaMD UV Clear", type: "sunscreen", condition: "acne", description: "Oil-free zinc protection.", usage: "Daily morning." },
        { name: "LRP Anthelios Milk", type: "sunscreen", condition: "dry_skin", description: "Broad spectrum SPF 60.", usage: "Every 2 hours." },
        { name: "Supergoop! Unseen", type: "sunscreen", condition: "normal", description: "Invisible weightless finish.", usage: "Before makeup." },
        { name: "Neutrogena Sheer Zinc", type: "sunscreen", condition: "oily_skin", description: "100% mineral protection.", usage: "Morning." },
        { name: "Biore UV Aqua Rich", type: "sunscreen", condition: "normal", description: "Lightweight watery essence.", usage: "Daily." },
        { name: "SkinCeuticals Physical", type: "sunscreen", condition: "dark_spots", description: "Universal tinted protection.", usage: "Morning." },
        { name: "Aveeno Protect + Hydrate", type: "sunscreen", condition: "dry_skin", description: "Oat-infused SPF 60.", usage: "Daily." },
        { name: "Shiseido Ultimate", type: "sunscreen", condition: "normal", description: "SynchroShield technology.", usage: "Outdoor use." },
        { name: "Innisfree Daily UV", type: "sunscreen", condition: "normal", description: "Moisturizing SPF 36.", usage: "Daily." },
        { name: "Eucerin Oil Control", type: "sunscreen", condition: "oily_skin", description: "Advanced oil control.", usage: "Morning." },

        // CREAMS (10)
        { name: "Differin Adapalene", type: "cream", condition: "acne", description: "Retinoid acne treatment.", usage: "Nightly." },
        { name: "LRP Effaclar Duo", type: "cream", condition: "acne", description: "Dual action blemish treatment.", usage: "Spot treatment." },
        { name: "CeraVe Renewing Night", type: "cream", condition: "dry_skin", description: "Peptide and ceramide complex.", usage: "Nightly." },
        { name: "Olay Retinol 24", type: "cream", condition: "dark_spots", description: "Visible overnight results.", usage: "Nightly." },
        { name: "Kate Somerville EradiKate", type: "cream", condition: "acne", description: "10% sulfur treatment.", usage: "Spot treatment." },
        { name: "Laneige Sleeping Mask", type: "cream", condition: "dry_skin", description: "Intense overnight hydration.", usage: "Nightly." },
        { name: "Murad Rapid Dark Spot", type: "cream", condition: "dark_spots", description: "Targeted correction cream.", usage: "Spot treatment." },
        { name: "IT Cosmetics Confidence", type: "cream", condition: "dry_skin", description: "Anti-aging transformation.", usage: "Twice daily." },
        { name: "Dr. Jart+ Cicapair", type: "cream", condition: "acne", description: "Tiger grass redness repair.", usage: "Daily." },
        { name: "Sunday Riley Ice", type: "cream", condition: "dry_skin", description: "Ceramide moisturizing cream.", usage: "Morning/Night." }
      ];

      const productsCol = collection(db, "products");
      for (const product of fullProductSet) {
        await addDoc(productsCol, product);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: "Database Fully Seeded", description: "50+ items added across all categories." });
    },
    onError: (error) => toast({ title: "Seeding Failed", description: error.message, variant: "destructive" })
  });

  if (user?.email !== 'sivasiva18223@gmail.com') {
    return <Navigate to="/" replace />;
  }

  const formatDateSafe = (dateVal) => {
    if (!dateVal || !isValid(new Date(dateVal)) || new Date(dateVal).getTime() <= 0) return '—';
    return format(new Date(dateVal), 'MMM d, yyyy');
  };

  // Stats
  const conditionData = {};
  analyses.forEach(a => {
    const label = conditionLabels[a.skin_condition] || a.skin_condition || 'Unknown';
    conditionData[label] = (conditionData[label] || 0) + 1;
  });
  const pieData = Object.entries(conditionData).map(([name, value]) => ({ name, value }));

  const severityData = { mild: 0, moderate: 0, severe: 0 };
  analyses.forEach(a => { if (a.severity && severityData[a.severity] !== undefined) severityData[a.severity]++; });
  const barData = Object.entries(severityData).map(([name, count]) => ({ name, count }));

  const handleEditAnalysis = (analysis) => {
    setEditingItem({ ...analysis });
    setIsAnalysisDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingItem({ ...product });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (editingItem?.id) updateMutation.mutate({ collectionName: 'products', id: editingItem.id, data });
    else addProductMutation.mutate(data);
  };

  const handleSaveAnalysis = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      skin_condition: formData.get('skin_condition'),
      confidence: parseInt(formData.get('confidence') || 0),
      severity: formData.get('severity'),
    };
    updateMutation.mutate({ collectionName: 'SkinAnalysis', id: editingItem.id, data });
  };

  const isLoading = loadingUsers || loadingAnalyses || loadingProducts;

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">System overview</p>
        </div>
        <div className="flex gap-2">
          {products.length < 10 && (
            <Button variant="outline" onClick={() => seedProductsMutation.mutate()} disabled={seedProductsMutation.isPending} className="rounded-full">
              <Sparkles className="w-4 h-4 mr-2" /> Seed All Categories
            </Button>
          )}
          <Button onClick={() => { setEditingItem(null); setIsProductDialogOpen(true); }} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="p-5"><Skeleton className="h-16" /></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value={users.length} icon={Users} color="bg-primary/10 text-primary" />
          <StatsCard title="Total Analyses" value={analyses.length} icon={ScanFace} color="bg-secondary text-secondary-foreground" />
          <StatsCard title="Products" value={products.length} icon={ShoppingBag} color="bg-accent text-accent-foreground" />
          <StatsCard title="Conditions" value={Object.keys(conditionData).length} icon={BarChart3} color="bg-primary/10 text-primary" />
        </div>
      )}

      <Tabs defaultValue="analyses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="charts">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="analyses">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDateSafe(a.created_at)}</TableCell>
                    <TableCell className="font-medium capitalize">{conditionLabels[a.skin_condition] || a.skin_condition || '—'}</TableCell>
                    <TableCell>{a.confidence || 0}%</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditAnalysis(a)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate({ collectionName: 'SkinAnalysis', id: a.id })}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Product Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{p.type}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate({ collectionName: 'products', id: p.id })}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.displayName || u.fullName || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDateSafe(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Condition Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Severity Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <Input name="name" defaultValue={editingItem?.name} required placeholder="Product Name" />
            <Select name="type" defaultValue={editingItem?.type || 'cleanser'}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cleanser">Cleanser</SelectItem><SelectItem value="moisturizer">Moisturizer</SelectItem><SelectItem value="serum">Serum</SelectItem>
                <SelectItem value="sunscreen">Sunscreen</SelectItem><SelectItem value="cream">Cream</SelectItem>
              </SelectContent>
            </Select>
            <Select name="condition" defaultValue={editingItem?.condition || 'normal'}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(conditionLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
