import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Sparkles, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { analyzeImage, fileToBase64, VisionAnalysis } from '../lib/vision';

interface Props {
  onAnalysis: (result: VisionAnalysis, previewUrl: string, file: File) => void;
}

// Badi photo ko pehle hi chhota kar deta hai (phone ki memory aur upload speed ke liye)
async function shrinkFile(file: File, maxSize = 768): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.7));
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

export default function ImageAnalyzer({ onAnalysis }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<'idle' | 'camera' | 'analyzing' | 'done' | 'error'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VisionAnalysis | null>(null);

  const analyze = async (file: File) => {
    setError('');
    setState('analyzing');
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    try {
      const small = await shrinkFile(file);
      const { base64, mimeType } = await fileToBase64(small);
      const analysis = await analyzeImage(base64, mimeType);
      setResult(analysis);
      setState('done');
      onAnalysis(analysis, previewUrl,small);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please fill in the details manually.');
      setState('error');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyze(file);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Camera state mein aate hi live camera chalu karo, bahar jaate hi band
  useEffect(() => {
    if (state !== 'camera') return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError('Camera could not be opened. Please allow camera permission, or use Upload Image.');
        setState('error');
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [state]);

  const openCamera = () => {
    // Purane browser / camera API nahi hai: phone ke camera app wala tareeka
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraRef.current?.click();
      return;
    }
    setError('');
    setState('camera');
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, 768 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) analyze(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.7
    );
  };

  const reset = () => {
    setState('idle');
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <span className="flex items-center gap-2">
          <Sparkles size={15} className="text-blue-600" />
          AI Image Analysis
          <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Auto-fills form</span>
        </span>
      </label>

      {state === 'idle' && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-300 transition-colors">
          <div className="flex justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Camera size={22} className="text-blue-600" />
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Upload size={22} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Upload or take a photo</p>
          <p className="text-xs text-gray-400 mb-5">AI will detect the issue and auto-fill Title, Description, Location & Severity</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button type="button" onClick={openCamera}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
              <Camera size={15} /> Take Photo
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors">
              <Upload size={15} /> Upload Image
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </div>
      )}

      {state === 'camera' && (
        <div className="border border-blue-200 rounded-2xl overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[60vh] object-cover" />
          <div className="flex gap-2 justify-center p-3 bg-white">
            <button type="button" onClick={capture}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700">
              <Camera size={15} /> Capture
            </button>
            <button type="button" onClick={() => setState('idle')}
              className="border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}

      {state === 'analyzing' && (
        <div className="border border-blue-200 bg-blue-50 rounded-2xl p-6">
          <div className="flex gap-4">
            {preview && <img src={preview} alt="Captured" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 size={16} className="text-blue-600 animate-spin" />
                <span className="text-sm font-semibold text-blue-700">AI analyzing image...</span>
              </div>
              <p className="text-xs text-blue-500">Detecting issue type, severity, and location clues</p>
              <div className="mt-3 space-y-1.5">
                {['Issue Title', 'Description', 'Location', 'Severity'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden flex-1">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <span className="text-xs text-blue-400 w-20">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {state === 'done' && result && (
        <div className="border border-green-200 bg-green-50 rounded-2xl p-4">
          <div className="flex gap-3">
            {preview && <img src={preview} alt="Analyzed" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-green-600" />
                  <span className="text-sm font-bold text-green-700">AI Analysis Complete</span>
                  <span className="text-xs text-green-500">{result.confidence}% confidence</span>
                </div>
                <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Title', value: result.title },
                  { label: 'Severity', value: result.severity },
                  { label: 'Category', value: result.category },
                  { label: 'Location', value: result.location || 'Not detected' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/70 rounded-lg px-2.5 py-1.5">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-xs font-semibold text-gray-700 capitalize truncate">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-2">✓ Form fields auto-filled below. Review and adjust as needed.</p>
            </div>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="border border-red-200 bg-red-50 rounded-2xl p-4">
          <div className="flex gap-3">
            {preview && <img src={preview} alt="Uploaded" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-red-500" />
                  <span className="text-sm font-bold text-red-700">Analysis failed</span>
                </div>
                <button onClick={reset} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <p className="text-xs text-red-600">{error}</p>
              <p className="text-xs text-gray-500 mt-1">Please fill in the details manually below.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}