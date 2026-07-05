import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
import { compressImage } from "@/lib/image";

const AdminMedia = () => {
  const [items, setItems] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("media_library").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      for (let file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name}: too large (>10MB)`); continue; }
        
        try {
          file = await compressImage(file, 1600, 0.8);
        } catch (err) {
          console.error("Compression failed for", file.name, err);
        }
        
        const path = `${user?.id ?? "anon"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from("media").upload(path, file);
        if (error) { toast.error(error.message); continue; }
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        await supabase.from("media_library").insert({
          file_name: file.name, storage_path: path, public_url: pub.publicUrl,
          mime_type: file.type, size_bytes: file.size, uploaded_by: user?.id,
        });
      }
      toast.success("Uploaded"); load();
    } finally { setUploading(false); }
  };

  const remove = async (id: string, path: string) => {
    if (!confirm("Delete this file?")) return;
    await supabase.storage.from("media").remove([path]);
    await supabase.from("media_library").delete().eq("id", id);
    await logActivity("Deleted media", "media", id);
    toast.success("Deleted"); load();
  };

  return (
    <AdminShell title="Media Library" actions={
      <>
        <Button variant="hero" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input ref={fileRef} type="file" hidden multiple accept="image/*"
          onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
      </>
    }>
      {items.length === 0 ? (
        <div className="gradient-border glass rounded-2xl p-12 text-center text-muted-foreground">
          No media yet. Upload images to reuse across projects, blogs, and services.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((m) => (
            <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-foreground/5">
              <img src={m.public_url} alt={m.file_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                <div className="text-[10px] text-center truncate w-full">{m.file_name}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(m.public_url); toast.success("URL copied"); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(m.id, m.storage_path)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
};
export default AdminMedia;
