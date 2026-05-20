import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const blank = () => ({
  title: "", description: "", client_id: null as string | null,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  location: "", meeting_link: "",
});

const AdminCalendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [meeting, setMeeting] = useState<any>(blank());

  const load = async () => {
    const [m, t, p, c] = await Promise.all([
      supabase.from("meetings").select("*, clients(company_name)").order("starts_at"),
      supabase.from("tasks").select("id,title,due_date,status").not("due_date", "is", null),
      supabase.from("projects").select("id,title,deadline").not("deadline", "is", null),
      supabase.from("clients").select("id, company_name"),
    ]);
    setClients(c.data ?? []);
    const ev: any[] = [];
    (m.data ?? []).forEach((x: any) => ev.push({
      id: `m-${x.id}`, title: `🤝 ${x.title}${x.clients ? " · " + x.clients.company_name : ""}`,
      start: x.starts_at, end: x.ends_at, backgroundColor: "hsl(var(--primary))", borderColor: "transparent",
      extendedProps: { type: "meeting", record: x },
    }));
    (t.data ?? []).forEach((x: any) => ev.push({
      id: `t-${x.id}`, title: `✅ ${x.title}`, start: x.due_date, allDay: true,
      backgroundColor: "hsl(var(--accent))", borderColor: "transparent",
    }));
    (p.data ?? []).forEach((x: any) => ev.push({
      id: `p-${x.id}`, title: `🚀 ${x.title} deadline`, start: x.deadline, allDay: true,
      backgroundColor: "hsl(var(--secondary))", borderColor: "transparent",
    }));
    setEvents(ev);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!meeting.title) return toast.error("Title required");
    const payload = {
      title: meeting.title, description: meeting.description, client_id: meeting.client_id,
      starts_at: new Date(meeting.starts_at).toISOString(),
      ends_at: new Date(meeting.ends_at).toISOString(),
      location: meeting.location, meeting_link: meeting.meeting_link,
    };
    const { error } = meeting.id
      ? await supabase.from("meetings").update(payload).eq("id", meeting.id)
      : await supabase.from("meetings").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Meeting saved"); setOpen(false); load();
  };

  const remove = async () => {
    if (!meeting.id || !confirm("Delete meeting?")) return;
    await supabase.from("meetings").delete().eq("id", meeting.id);
    toast.success("Deleted"); setOpen(false); load();
  };

  return (
    <AdminShell title="Calendar & Meetings" actions={
      <Button size="sm" variant="hero" onClick={() => { setMeeting(blank()); setOpen(true); }}><Plus className="w-3.5 h-3.5" />New Meeting</Button>
    }>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{meeting.id ? "Edit" : "New"} Meeting</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={meeting.title} onChange={(e) => setMeeting({ ...meeting, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={2} value={meeting.description ?? ""} onChange={(e) => setMeeting({ ...meeting, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Starts</Label><Input type="datetime-local" value={meeting.starts_at?.slice(0,16)} onChange={(e) => setMeeting({ ...meeting, starts_at: e.target.value })} /></div>
              <div><Label>Ends</Label><Input type="datetime-local" value={meeting.ends_at?.slice(0,16)} onChange={(e) => setMeeting({ ...meeting, ends_at: e.target.value })} /></div>
            </div>
            <div>
              <Label>Client</Label>
              <Select value={meeting.client_id ?? ""} onValueChange={(v) => setMeeting({ ...meeting, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label><Input value={meeting.location ?? ""} onChange={(e) => setMeeting({ ...meeting, location: e.target.value })} /></div>
              <div><Label>Meeting link</Label><Input value={meeting.meeting_link ?? ""} placeholder="https://meet…" onChange={(e) => setMeeting({ ...meeting, meeting_link: e.target.value })} /></div>
            </div>
            <div className="flex justify-between pt-2">
              {meeting.id ? <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="w-4 h-4 text-destructive" /></Button> : <span />}
              <Button onClick={save} variant="hero">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="gradient-border glass rounded-2xl p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
          initialView="dayGridMonth"
          events={events}
          height="75vh"
          dateClick={(info) => { setMeeting({ ...blank(), starts_at: info.dateStr.slice(0,16) || new Date(info.date).toISOString().slice(0,16) }); setOpen(true); }}
          eventClick={(info) => {
            const ext: any = info.event.extendedProps;
            if (ext.type === "meeting") {
              setMeeting({
                ...ext.record,
                starts_at: ext.record.starts_at?.slice(0, 16),
                ends_at: ext.record.ends_at?.slice(0, 16),
              });
              setOpen(true);
            }
          }}
        />
      </div>
    </AdminShell>
  );
};
export default AdminCalendar;
