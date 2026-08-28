"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Wand2,
} from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import Toast, { ToastKind } from "@/components/Toast";

const MAX_SIZE_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

type BgOption = { id: string; label: string; value: string; swatch: string };

const BG_PRESETS: BgOption[] = [
  { id: "transparent", label: "Transparent", value: "transparent", swatch: "" },
  { id: "white", label: "White", value: "#ffffff", swatch: "#ffffff" },
  { id: "black", label: "Black", value: "#000000", swatch: "#000000" },
  { id: "studio-blue", label: "Studio Blue", value: "#2563eb", swatch: "#2563eb" },
  { id: "soft-gray", label: "Soft Gray", value: "#e2e8f0", swatch: "#e2e8f0" },
  { id: "mint", label: "Mint", value: "#a7f3d0", swatch: "#a7f3d0" },
];

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/remove-bg")
      .then((r) => r.json())
      .then((d) => setApiConfigured(Boolean(d.configured)))
      .catch(() => setApiConfigured(null));
  }, []);

  const showToast = (message: string, kind: ToastKind = "error") =>
    setToast({ message, kind });

  const validateAndSet = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Sudhu PNG, JPG, ba WEBP image support kora hoy.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      showToast("Image size 12MB er beshi hote parbe na.");
      return;
    }
    setSelectedFile(file);
    setOriginalImage(URL.createObjectURL(file));
    setProcessedImage(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }, []);

  const removeBackground = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/remove-bg", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok && data.result) {
        setProcessedImage(data.result);
        showToast("Background successfully remove kora hoyeche!", "success");
      } else {
        showToast(data.error || "Background remove korte somossa hoyeche.");
      }
    } catch (err) {
      showToast("Network somossa — internet connection check korun.");
    } finally {
      setLoading(false);
    }
  };

  const downloadHD = async (format: "png" | "jpeg" = "png") => {
    if (!processedImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = processedImage;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      if (bgColor !== "transparent" || format === "jpeg") {
        ctx!.fillStyle = bgColor === "transparent" ? "#ffffff" : bgColor;
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx!.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `cutoutpro-hd.${format === "jpeg" ? "jpg" : "png"}`;
      link.href = canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", 0.95);
      link.click();
    };

    img.onerror = () => showToast("Download e somossa hoyeche, abar try korun.");
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
    setBgColor("transparent");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-4 sm:px-6">
      {toast && (
        <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center py-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">
            CutoutPro AI
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> HD Precision Engine
          </span>
          <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Friendly
          </span>
        </div>
      </header>

      {apiConfigured === false && (
        <div className="w-full max-w-6xl mt-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          REPLICATE_API_TOKEN set kora nei — <code className="text-amber-200">.env.local</code>{" "}
          file e apnar API key add korun (dekhun{" "}
          <code className="text-amber-200">.env.local.example</code>).
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center py-10">
        {!originalImage && (
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Ekhoni background remove korun,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                AI diye
              </span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              Chul o soothsome details soho 100% nikhut precision — matro kicchu second-e.
            </p>
          </div>
        )}

        {!originalImage ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl h-80 border-2 border-dashed rounded-3xl bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
              isDragActive
                ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
                : "border-slate-700 hover:border-indigo-500"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload or Drag & Drop Image</h3>
            <p className="text-slate-400 text-sm">PNG, JPG, WEBP — max 12MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && validateAndSet(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            {processedImage ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium tracking-wide">
                    BEFORE / AFTER — TENE DEKHUN
                  </span>
                  <Wand2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div
                  className="w-full h-96 rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: bgColor === "transparent" ? undefined : bgColor,
                    backgroundImage:
                      bgColor === "transparent"
                        ? "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)"
                        : undefined,
                    backgroundSize: "20px 20px",
                  }}
                >
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={originalImage} alt="Original" />}
                    itemTwo={<ReactCompareSliderImage src={processedImage} alt="Background removed" />}
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-2 font-medium">ORIGINAL IMAGE</span>
                  <div className="w-full h-80 rounded-xl overflow-hidden flex items-center justify-center bg-slate-950">
                    <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 h-80 justify-center w-full">
                      <div className="w-full h-full rounded-xl bg-slate-800/50 bg-[linear-gradient(110deg,#1e293b_8%,#334155_18%,#1e293b_33%)] bg-[length:200%_100%] animate-shimmer flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
                          <span className="text-sm text-slate-300">
                            AI diye fine edges process hocche...
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm flex flex-col items-center gap-3 h-80 justify-center">
                      <ImageIcon className="w-10 h-10" />
                      Background remove korte niche button e click korun
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Controls */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!processedImage && (
                <button
                  onClick={removeBackground}
                  disabled={loading}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? "Processing..." : "Remove Background Now"}
                </button>
              )}

              {processedImage && (
                <>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl flex-wrap">
                    <span className="text-xs text-slate-400 pl-2">Background:</span>
                    {BG_PRESETS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBgColor(opt.value)}
                        title={opt.label}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${
                          bgColor === opt.value ? "border-indigo-400 scale-110" : "border-slate-700"
                        } ${opt.id === "transparent" ? "bg-slate-800 text-xs" : ""}`}
                        style={opt.swatch ? { backgroundColor: opt.swatch } : undefined}
                      >
                        {opt.id === "transparent" ? "🏁" : ""}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={bgColor === "transparent" ? "#ffffff" : bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none"
                      title="Custom Color"
                    />
                  </div>

                  <button
                    onClick={() => downloadHD("png")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Download className="w-5 h-5" /> Download PNG (HD)
                  </button>
                  <button
                    onClick={() => downloadHD("jpeg")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" /> JPG
                  </button>
                </>
              )}

              <button
                onClick={reset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-3 rounded-xl flex items-center gap-2 transition-all ml-auto"
              >
                <RefreshCw className="w-4 h-4" /> New Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-slate-600 text-xs text-center py-6 border-t border-slate-900 w-full max-w-6xl">
        Powered by High-Accuracy AI Deep Learning • BRIA RMBG Engine
      </footer>
    </main>
  );
}
