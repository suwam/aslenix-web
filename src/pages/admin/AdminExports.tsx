import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, toCSV } from "@/lib/csv";
import { FileDown, Database, FolderKanban, Newspaper, Inbox, Users, FileText } from "lucide-react";
import { toast } from "sonner";

const EXPORTS = [
  { table: "leads", icon: Inbox, label: "Leads" },
  { table: "projects", icon: FolderKanban, label: "Projects" },
  { table: "blogs", icon: Newspaper, label: "Blogs" },
  { table: "clients", icon: Users, label: "Clients" },
  { table: "invoices", icon: FileText, label: "Invoices" },
  { table: "tasks", icon: Database, label: "Tasks" },
];

const AdminExports = () => {
  const exportTable = async (table: string) => {
    const { data, error } = await supabase.from(table as any).select("*");
    if (error) return toast.error(error.message);
    if (!data?.length) return toast.error("Nothing to export");
    downloadCSV(`aslenix-${table}-${Date.now()}.csv`, toCSV(data));
    toast.success(`Exported ${data.length} ${table}`);
  };

  return (
    <AdminShell title="Data Export">
      <p className="text-muted-foreground mb-6">Export your data to CSV. Open in Excel, Google Sheets, or any spreadsheet tool.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORTS.map((e) => (
          <button key={e.table} onClick={() => exportTable(e.table)}
            className="gradient-border glass rounded-2xl p-6 text-left hover:scale-[1.02] transition group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
                <e.icon className="w-5 h-5 text-foreground" />
              </div>
              <FileDown className="w-4 h-4 text-muted-foreground group-hover:text-accent transition" />
            </div>
            <h3 className="font-display text-lg font-semibold">{e.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">Export all {e.label.toLowerCase()} as CSV</p>
          </button>
        ))}
      </div>
    </AdminShell>
  );
};

export default AdminExports;
