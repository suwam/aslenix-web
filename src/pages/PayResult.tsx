import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PayResult = ({ outcome }: { outcome: "success" | "failed" }) => {
  const { token } = useParams();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");

  useEffect(() => {
    const txId = params.get("tx");
    const data = params.get("data");
    if (outcome === "failed" || !txId) { setStatus("failed"); return; }
    supabase.functions.invoke("esewa-verify", { body: { tx_id: txId, encoded_data: data } })
      .then(({ data: r, error }) => {
        if (error || r?.error) setStatus("failed");
        else setStatus(r.status === "success" ? "success" : r.status === "pending" ? "pending" : "failed");
      });
  }, [outcome, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="gradient-border glass rounded-3xl max-w-md w-full p-10 text-center">
        {status === "loading" && <Loader2 className="w-12 h-12 animate-spin mx-auto text-accent" />}
        {status === "success" && <><CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4" /><h1 className="text-2xl font-display font-semibold mb-2">Payment received</h1><p className="text-muted-foreground">Your invoice has been marked as paid. Thank you!</p></>}
        {status === "pending" && <><Loader2 className="w-16 h-16 mx-auto text-yellow-400 mb-4 animate-spin" /><h1 className="text-2xl font-display font-semibold mb-2">Payment pending</h1><p className="text-muted-foreground">eSewa is still processing this transaction.</p></>}
        {status === "failed" && <><XCircle className="w-16 h-16 mx-auto text-destructive mb-4" /><h1 className="text-2xl font-display font-semibold mb-2">Payment failed</h1><p className="text-muted-foreground">No charge was made. You can try again.</p><Button asChild className="mt-4"><Link to={`/pay/${token}`}>Try again</Link></Button></>}
      </div>
    </div>
  );
};
export default PayResult;
