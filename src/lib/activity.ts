import { supabase } from "@/integrations/supabase/client";

export const logActivity = async (
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>,
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      details: (details as never) ?? null,
    });
  } catch {
    // best-effort, never break UX
  }
};
