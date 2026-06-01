import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseRealtime<T>(fetcher: () => Promise<T>, tables: string[], deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const channelId = useRef(Math.random().toString(36).slice(2));
  const tablesKey = useMemo(() => JSON.stringify(tables), [tables]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const result = await fetcher();
      if (!mounted) return;
      setData(result);
    };

    load();

    if (tables.length === 0) return () => {
      mounted = false;
    };

    const channel = supabase.channel(`realtime-${tables.join("-")}-${channelId.current}`);
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
  }, [tablesKey, ...deps]);

  return data;
}
