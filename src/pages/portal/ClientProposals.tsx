import { ClientPortalLayout } from "@/components/portal/ClientPortalLayout";
import { FileText } from "lucide-react";

const ClientProposals = () => (
  <ClientPortalLayout title="Documents & Proposals">
    <div className="text-center py-20 text-muted-foreground">
      <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Proposals and contracts shared by ASLENIX will appear here.</p>
      <p className="text-xs mt-2">Reach out via Messages to request a custom proposal.</p>
    </div>
  </ClientPortalLayout>
);
export default ClientProposals;
