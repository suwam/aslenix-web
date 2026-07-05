import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, ImageIcon, X, Crop, MoveHorizontal, MoveVertical, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  cropAspect?: number | null;
};

export const MediaPicker = ({ value, onChange, label = "Image", cropAspect = 16 / 9 }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [library, setLibrary] = useState<{ id: string; public_url: string; file_name: string }[]>([]);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const loadLibrary = async () => {
    const { data } = await supabase
      .from("media_library")
      .select("id,public_url,file_name")
      .order("created_at", { ascending: false })
      .limit(60);
    setLibrary(data ?? []);
  };

  useEffect(() => { if (open) loadLibrary(); }, [open]);

  useEffect(() => {
    return () => {
      if (cropUrl) URL.revokeObjectURL(cropUrl);
    };
  }, [cropUrl]);

  const resetCrop = () => {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropFile(null);
    setCropUrl(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const compressOriginal = async (file: File) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not load image"));
    });
    URL.revokeObjectURL(url);

    let width = image.naturalWidth;
    let height = image.naturalHeight;
    const maxDim = 1600;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image");
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
    if (!blob) throw new Error("Could not compress image");
    const name = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${name}-optimized.webp`, { type: "image/webp" });
  };

  const prepareCrop = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (cropAspect === null) {
      compressOriginal(file).then(f => upload(f)).catch(() => upload(file));
      return;
    }
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropFile(file);
    setCropUrl(URL.createObjectURL(file));
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const makeCroppedFile = async (file: File) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not load image"));
    });
    URL.revokeObjectURL(url);

    const outputWidth = cropAspect >= 1 ? 1600 : Math.round(1600 * cropAspect);
    const outputHeight = cropAspect >= 1 ? Math.round(1600 / cropAspect) : 1600;
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image");

    const baseScale = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
    const scale = baseScale * zoom;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const maxOffsetX = Math.max(0, (drawWidth - outputWidth) / 2);
    const maxOffsetY = Math.max(0, (drawHeight - outputHeight) / 2);
    const drawX = (outputWidth - drawWidth) / 2 + (offsetX / 100) * maxOffsetX;
    const drawY = (outputHeight - drawHeight) / 2 + (offsetY / 100) * maxOffsetY;

    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
    if (!blob) throw new Error("Could not crop image");
    const name = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${name}-cropped.webp`, { type: "image/webp" });
  };

  const upload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user?.id ?? "anon"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("media_library").insert({
        file_name: file.name, storage_path: path, public_url: pub.publicUrl,
        mime_type: file.type, size_bytes: file.size, uploaded_by: user?.id,
      });
      onChange(pub.publicUrl);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const cropAndUpload = async () => {
    if (!cropFile) return;
    setUploading(true);
    try {
      const cropped = await makeCroppedFile(cropFile);
      await upload(cropped);
      resetCrop();
    } catch (e: any) {
      toast.error(e.message ?? "Crop failed. Uploading original image instead.");
      const original = cropFile;
      resetCrop();
      await upload(original);
    }
  };

  const uploadOriginal = async () => {
    if (!cropFile) return;
    setUploading(true);
    try {
      const compressed = await compressOriginal(cropFile);
      await upload(compressed);
      resetCrop();
    } catch (e: any) {
      toast.error(e.message ?? "Optimization failed. Uploading raw image instead.");
      const original = cropFile;
      resetCrop();
      await upload(original);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden glass border border-foreground/5">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-foreground/10 rounded-xl p-8 text-center">
          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <div className="text-sm text-muted-foreground">No image selected</div>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <Button type="button" variant="glass" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <ImageIcon className="w-3.5 h-3.5" /> Pick from library
        </Button>
        <input
          ref={fileRef} type="file" accept="image/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) prepareCrop(f); e.target.value = ""; }}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Media Library</DialogTitle></DialogHeader>
          {library.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No media yet. Upload some files first.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {library.map((m) => (
                <button
                  key={m.id} type="button"
                  onClick={() => { onChange(m.public_url); setOpen(false); }}
                  className="aspect-square rounded-lg overflow-hidden border border-foreground/5 hover:border-accent transition-colors"
                >
                  <img src={m.public_url} alt={m.file_name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cropFile} onOpenChange={(nextOpen) => { if (!nextOpen) resetCrop(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Crop Photo</DialogTitle></DialogHeader>
          {cropUrl && (
            <div className="space-y-5">
              <div
                className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-foreground/10 bg-foreground"
                style={{ aspectRatio: cropAspect }}
              >
                <img
                  src={cropUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    transform: `scale(${zoom}) translate(${offsetX / 8}%, ${offsetY / 8}%)`,
                    transformOrigin: "center",
                  }}
                />
                <div className="pointer-events-none absolute inset-0 border-2 border-foreground/50" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ZoomIn className="h-4 w-4" /> Zoom
                  </div>
                  <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={([v]) => setZoom(v)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MoveHorizontal className="h-4 w-4" /> Horizontal
                  </div>
                  <Slider value={[offsetX]} min={-100} max={100} step={1} onValueChange={([v]) => setOffsetX(v)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MoveVertical className="h-4 w-4" /> Vertical
                  </div>
                  <Slider value={[offsetY]} min={-100} max={100} step={1} onValueChange={([v]) => setOffsetY(v)} />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-foreground/10 pt-4">
                <Button type="button" variant="ghost" onClick={resetCrop}>Cancel</Button>
                <Button type="button" variant="glass" disabled={uploading} onClick={uploadOriginal}>
                  <Upload className="h-4 w-4" /> Upload original
                </Button>
                <Button type="button" variant="hero" disabled={uploading} onClick={cropAndUpload}>
                  <Crop className="h-4 w-4" /> {uploading ? "Uploading..." : "Crop & Upload"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
