import { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Check,
  X,
  Loader2,
  AlertCircle,
  ImagePlus,
} from 'lucide-react';

interface Props {
  onCapture: (dataUrl: string, file: File) => void;
}

type Mode = 'idle' | 'streaming' | 'preview' | 'fallback';

export default function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    setStarting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setMode('streaming');
      // wait for video element to mount, then attach
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError(
        'Camera is not available. You can select a photo from your device instead.'
      );
      setMode('fallback');
    } finally {
      setStarting(false);
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const file = new File([blob], `photo-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    setCapturedUrl(dataUrl);
    setCapturedFile(file);
    stopStream();
    setMode('preview');
  }

  function retake() {
    setCapturedUrl(null);
    setCapturedFile(null);
    openCamera();
  }

  function confirm() {
    if (capturedUrl && capturedFile) {
      onCapture(capturedUrl, capturedFile);
    }
  }

  function handleFallbackFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedUrl(reader.result as string);
      setCapturedFile(file);
      setMode('preview');
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    return () => stopStream();
  }, []);

  /* ---------- IDLE: big button ---------- */
  if (mode === 'idle') {
    return (
      <div>
        <button
          onClick={openCamera}
          disabled={starting}
          className="mt-6 flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white py-14 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
        >
          {starting ? (
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Camera className="h-8 w-8" strokeWidth={2} />
            </div>
          )}
          <span className="text-base font-semibold text-slate-900">
            {starting ? 'Opening camera…' : 'Take Photo of Issue'}
          </span>
          <span className="text-xs text-slate-400">
            Tap to open your camera
          </span>
        </button>
      </div>
    );
  }

  /* ---------- STREAMING: live camera ---------- */
  if (mode === 'streaming') {
    return (
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-black">
        <div className="relative">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-[360px] w-full object-cover"
          />
          {/* viewfinder frame */}
          <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-white/40" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/90">
            Center the issue in the frame
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 bg-black py-5">
          <button
            onClick={() => {
              stopStream();
              setMode('idle');
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={capture}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition active:scale-90"
          >
            <span className="h-13 w-13 flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-900">
              <Camera className="h-6 w-6 text-slate-900" />
            </span>
          </button>
          <div className="w-11" />
        </div>
      </div>
    );
  }

  /* ---------- PREVIEW: captured photo ---------- */
  if (mode === 'preview' && capturedUrl) {
    return (
      <div className="mt-5">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black">
          <img
            src={capturedUrl}
            alt="Captured"
            className="h-[360px] w-full object-cover"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={retake}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-4 text-base font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50"
          >
            <RefreshCw className="h-5 w-5" /> Retake
          </button>
          <button
            onClick={confirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-emerald-400"
          >
            <Check className="h-5 w-5" strokeWidth={3} /> Use Photo
          </button>
        </div>
      </div>
    );
  }

  /* ---------- FALLBACK: file picker ---------- */
  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFallbackFile}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white py-14 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
          <ImagePlus className="h-8 w-8" strokeWidth={2} />
        </div>
        <span className="text-base font-semibold text-slate-900">
          Select a Photo
        </span>
        <span className="text-xs text-slate-400">
          Choose from your device
        </span>
      </button>
      <button
        onClick={() => {
          setError(null);
          setMode('idle');
        }}
        className="mt-3 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        Try camera again
      </button>
    </div>
  );
}
