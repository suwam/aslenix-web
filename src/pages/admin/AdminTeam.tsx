import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Plus, Pencil, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

type TeamMember = {
  id?: string;
  name: string;
  role: string;
  bio?: string | null;
  photo_url?: string | null;
  position: number;
  active: boolean;
};

const emptyMember: TeamMember = {
  name: "",
  role: "",
  bio: "",
  photo_url: "",
  position: 0,
  active: true,
};

const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember>(emptyMember);
  const [search, setSearch] = useState("");

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const saveMember = async () => {
    if (!editing.name.trim() || !editing.role.trim()) {
      return toast.error("Name and role are required");
    }

    const payload = {
      ...editing,
      position: editing.position ?? 0,
      active: editing.active ?? true,
    };

    const { error } = editing.id
      ? await supabase.from("team_members").update(payload).eq("id", editing.id)
      : await supabase.from("team_members").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${editing.id ? "Updated" : "Created"} team member`);
    await logActivity(
      `${editing.id ? "Updated" : "Created"} team member: ${editing.name}`,
      "team_members",
      editing.id ?? ""
    );
    setOpen(false);
    setEditing(emptyMember);
    loadMembers();
  };

  const deleteMember = async (member: TeamMember) => {
    if (!member.id || !confirm(`Delete ${member.name}?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", member.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted team member");
    loadMembers();
  };

  const filtered = members.filter((member) =>
    !search ||
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell
      title="Team Members"
      actions={
        <Dialog open={open} onOpenChange={(value) => {
          setOpen(value);
          if (!value) setEditing(emptyMember);
        }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="w-3.5 h-3.5" /> New Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit" : "New"} Team Member</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              <div className="md:col-span-2">
                <Label>Name *</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Role *</Label>
                <Input
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={editing.position}
                  onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <MediaPicker
                  label="Photo"
                  value={editing.photo_url}
                  cropAspect={1}
                  onChange={(photo_url) => setEditing({ ...editing, photo_url })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  value={editing.bio ?? ""}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  id="active-member"
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="h-4 w-4 rounded border-foreground/10 bg-muted text-brand-gradient focus:ring-transparent"
                />
                <label htmlFor="active-member" className="text-sm text-foreground">
                  Visible in About section
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-foreground/10 bg-background/95 px-6 py-4 backdrop-blur">
              <Button variant="hero" onClick={saveMember} className="w-full sm:w-auto">
                {editing.id ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <Input
          placeholder="Search team members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">Position controls sort order in the About section.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((member) => (
          <div key={member.id ?? member.name} className="gradient-border glass rounded-3xl p-5 group">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-foreground/5 text-lg font-semibold text-foreground/90">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="h-16 w-16 rounded-3xl object-cover" />
                ) : (
                  <span>{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    #{member.position}
                  </span>
                </div>
                <p className="text-sm text-accent/90 mt-1">{member.role}</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{member.bio || "No bio provided."}</p>
            <div className="mt-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditing(member);
                  setOpen(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteMember(member)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        {loading ? (
          <div className="col-span-full py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent opacity-50" /></div>
        ) : filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-foreground/10 bg-foreground/5 p-10 text-center text-sm text-muted-foreground">
            No team members found.
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminTeam;
