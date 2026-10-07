import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onUpload(file, URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[2rem] aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-6 text-center
            ${dragOver 
              ? 'border-primary bg-primary/5 scale-[1.01] shadow-inner' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary animate-bounce">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-foreground mb-1">Drag and drop your skin photo here</p>
          <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, WebP up to 10MB</p>
          
          <Button variant="secondary" size="sm" className="rounded-full text-[10px] font-bold mt-4 h-8 px-4">
            Browse Gallery
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] border-4 border-muted/20 shadow-inner">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 rounded-full w-8 h-8 hover:scale-105 active:scale-95 transition-all shadow-md"
            onClick={clear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}