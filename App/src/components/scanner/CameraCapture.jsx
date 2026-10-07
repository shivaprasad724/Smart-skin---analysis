import { useState, useRef, useCallback } from 'react';
import { Camera, RotateCcw, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setStreaming(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      console.error("Camera access error", err);
    }
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(dataUrl);
    stopCamera();
  };

  const retake = () => {
    setPreview(null);
    startCamera();
  };

  const confirm = () => {
    if (!preview) return;
    const arr = preview.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    const file = new File([u8arr], 'skin-capture.jpg', { type: mime });
    onCapture(file, preview);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border-4 border-muted/20 shadow-inner">
        {!streaming && !preview && (
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center text-primary animate-pulse">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-300">Allow camera permission to scan</p>
              <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">Your selfie is processed securely on-device and never shared.</p>
            </div>
            <Button onClick={startCamera} className="rounded-full bg-primary text-white text-xs font-bold px-6 h-10 shadow-lg shadow-primary/20">
              Enable Camera
            </Button>
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${streaming ? 'block' : 'hidden'}`}
          playsInline
          muted
          autoPlay
        />

        {/* Viewfinder Guideline Overlay */}
        {streaming && (
          <>
            {/* Target guidelines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-dashed border-white/20" />
              </div>
            </div>
            {/* Status floating text */}
            <div className="absolute top-4 inset-x-0 text-center pointer-events-none">
              <span className="inline-block bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider">
                Align face inside the circle
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line pointer-events-none" />
          </>
        )}

        {preview && (
          <img src={preview} alt="Captured" className="w-full h-full object-cover absolute inset-0" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Modern Round Shutter controls */}
      <div className="flex gap-4 justify-center items-center py-2">
        {streaming && (
          <>
            <button onClick={handleCancel} className="w-10 h-10 rounded-full bg-muted/80 text-muted-foreground flex items-center justify-center hover:bg-muted active:scale-95 transition-all">
              <X className="w-4 h-4" />
            </button>
            <button onClick={capture} className="w-16 h-16 rounded-full border-4 border-background bg-primary ring-2 ring-primary/40 flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-primary/30">
              <div className="w-6 h-6 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10" /> {/* Spacer */}
          </>
        )}
        {preview && (
          <>
            <Button variant="outline" onClick={retake} className="rounded-full text-xs font-bold h-10 px-5 border-border/60 hover:bg-muted">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retake
            </Button>
            <Button onClick={confirm} className="rounded-full text-xs font-bold h-10 px-5 bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Use Photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}