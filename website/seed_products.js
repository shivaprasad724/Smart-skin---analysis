import { db } from './src/lib/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

const initialProducts = [
  // ACNE
  {
    name: "La Roche-Posay Effaclar Duo",
    type: "cream",
    condition: "acne",
    description: "Dual action acne treatment that reduces the number and severity of acne blemishes.",
    usage: "Apply a thin layer daily to affected areas."
  },
  {
    name: "CeraVe Foaming Facial Cleanser",
    type: "cleanser",
    condition: "acne",
    description: "Cleanses and removes oil without disrupting the protective skin barrier.",
    usage: "Massage cleanser onto wet skin, then rinse."
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    type: "serum",
    condition: "acne",
    description: "High-strength vitamin and mineral blemish formula.",
    usage: "Apply to entire face morning and evening before heavier creams."
  },

  // DRY SKIN
  {
    name: "Neutrogena Hydro Boost Water Gel",
    type: "moisturizer",
    condition: "dry_skin",
    description: "Hyaluronic Acid formula absorbs quickly like a gel but has the long-lasting moisturizing power of a cream.",
    usage: "Apply evenly to face and neck after cleansing."
  },
  {
    name: "Cetaphil Gentle Skin Cleanser",
    type: "cleanser",
    condition: "dry_skin",
    description: "Hydrating glycerin and essential vitamins B5 & B3 to preserve skin's natural moisture barrier.",
    usage: "Apply and massage gently. Rinse with water or remove with cotton pad."
  },

  // OILY SKIN
  {
    name: "COSRX Low pH Good Morning Gel Cleanser",
    type: "cleanser",
    condition: "oily_skin",
    description: "Formulated with botanical skin-purifying ingredients, works to soothe, refresh, and soften the skin.",
    usage: "Gently massage a small amount on wet skin. Rinse with lukewarm water."
  },
  {
    name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant",
    type: "serum",
    condition: "oily_skin",
    description: "Unclogs & diminishes enlarged pores, exfoliates dead skin cells, smooths wrinkles & brightens skin tone.",
    usage: "Apply once or twice daily after cleansing and toning."
  },

  // DARK SPOTS / PIGMENTATION
  {
    name: "Kiehl's Clearly Corrective Dark Spot Solution",
    type: "serum",
    condition: "dark_spots",
    description: "Highly effective dark spot corrector and skin tone brightener.",
    usage: "Apply dark spot serum as a spot treatment or over entire face."
  },
  {
    name: "EltaMD UV Clear Broad-Spectrum SPF 46",
    type: "sunscreen",
    condition: "dark_spots",
    description: "Oil-free sunscreen helps calm and protect sensitive skin types prone to breakouts and discoloration.",
    usage: "Apply liberally to face and neck 15 minutes before sun exposure."
  }
];

async function seed() {
  console.log("Starting to seed products...");
  const productsCol = collection(db, "products");

  for (const product of initialProducts) {
    try {
      const docRef = await addDoc(productsCol, product);
      console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  console.log("Seeding complete!");
}

seed();
