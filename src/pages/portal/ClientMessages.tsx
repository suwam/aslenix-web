import { useEffect, useRef, useState } from "react";
import { ClientPortalLayout, usePortalProfile } from "@/components/portal/ClientPortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ClientMessages = () => {
  const profile = usePortalProfile();
  const { user } = useAuth();
  const [conv, setConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.client_id) return;
    (async () => {
      let { data } = await supabase.from("conversations").select("*").eq("client_id", profile.client_id).maybeSingle();
      if (!data) {
        const ins = await supabase.from("conversations").insert({
          client_id: profile.client_id, client_user_id: profile.id, subject: "General",
        }).select().single();
        data = ins.data;
      }
      setConv(data);
    })();
  }, [profile]);

  useEffect(() => {
    if (!conv) return;
    supabase.from("messages").select("*").eq("conversation_id", conv.id).order("created_at").then(({ data }) => setMessages(data ?? []));
    supabase.from("conversations").update({ unread_client: 0 }).eq("id", conv.id);
    const ch = supabase.channel(`conv-c-${conv.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conv.id}` },
        (p) => setMessages((m) => [...m, p.new as any]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conv]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !conv) return;
    const body = text.trim(); setText("");
    await supabase.from("messages").insert({ conversation_id: conv.id, sender_id: user?.id, sender_role: "client", body });
  };

  return (
    <ClientPortalLayout title="Messages">
      <div className="gradient-border glass rounded-2xl flex flex-col h-[70vh]">
        <div ref={scroller} className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_role === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.sender_role === "client" ? "bg-brand-gradient text-white" : "bg-white/10"}`}>
                <div>{m.body}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-center text-muted-foreground py-20">Start the conversation</div>}
        </div>
        <div className="p-3 border-t border-white/5 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" />
          <Button onClick={send} variant="hero"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </ClientPortalLayout>
  );
};
export default ClientMessages;
