import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const AdminChat = () => {
  const { user } = useAuth();
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    const { data } = await supabase.from("conversations").select("*, clients(company_name)").order("last_message_at", { ascending: false });
    setConvs(data ?? []);
  };
  useEffect(() => { loadConvs(); }, []);

  useEffect(() => {
    if (!active) return;
    supabase.from("messages").select("*").eq("conversation_id", active.id).order("created_at").then(({ data }) => setMessages(data ?? []));
    supabase.from("conversations").update({ unread_admin: 0 }).eq("id", active.id).then(loadConvs);

    const ch = supabase.channel(`conv-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active.id}` },
        (p) => setMessages((m) => [...m, p.new as any]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !active) return;
    const body = text.trim(); setText("");
    await supabase.from("messages").insert({
      conversation_id: active.id, sender_id: user?.id, sender_role: "admin", body,
    });
  };

  return (
    <AdminShell title="Messages">
      <div className="grid grid-cols-12 gap-4 h-[75vh]">
        <div className="col-span-4 gradient-border glass rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground">Conversations</div>
          <div className="flex-1 overflow-auto">
            {convs.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No conversations yet</div>}
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActive(c)} className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 ${active?.id === c.id ? "bg-white/10" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{c.clients?.company_name ?? c.subject}</span>
                  {c.unread_admin > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gradient text-white">{c.unread_admin}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-8 gradient-border glass rounded-2xl flex flex-col">
          {!active ? (
            <div className="m-auto text-muted-foreground">Select a conversation</div>
          ) : (
            <>
              <div className="p-3 border-b border-white/5"><div className="font-medium">{active.clients?.company_name ?? active.subject}</div></div>
              <div ref={scroller} className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.sender_role === "admin" ? "bg-brand-gradient text-white" : "bg-white/10"}`}>
                      <div>{m.body}</div>
                      <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/5 flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" />
                <Button onClick={send} variant="hero"><Send className="w-4 h-4" /></Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
};
export default AdminChat;
