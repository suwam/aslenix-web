import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseRealtime<T>(fetcher: () => Promise<T>, tables: string[], deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const result = await fetcher();
      if (!mounted) return;
      setData(result);
    };

    load();

    const channel = supabase.channel(`realtime-${tables.join("-")}`);
    tables.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        load();
      });
    });
    channel.subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [JSON.stringify(tables), ...deps]);

  return data;
}
