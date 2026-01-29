import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Lead {
  id: string;
  name: string;
  email: string;
  company_name: string;
  role: string;
  company_description: string;
  target_icp: string;
  custom_icp: string | null;
  selected_tones: string[];
  created_at: string;
}

const AdminLeads = () => {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("get-leads", {
        body: { password },
      });

      if (error) {
        setError("Failed to authenticate");
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      setLeads(data.leads || []);
      setIsAuthenticated(true);
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Company",
      "Role",
      "Company Description",
      "Target ICP",
      "Tones",
      "Created At",
    ];

    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.company_name,
      lead.role,
      lead.company_description,
      lead.custom_icp || lead.target_icp,
      lead.selected_tones.join(", "),
      new Date(lead.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="card-elevated p-8 md:p-10 w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
            <p className="text-muted-foreground">
              Enter the admin password to view leads
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "View Leads"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Captured Leads</h1>
              <p className="text-muted-foreground">{leads.length} total leads</p>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {leads.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <p className="text-muted-foreground">No leads captured yet.</p>
          </div>
        ) : (
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Target ICP
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-foreground">{lead.name}</td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-primary hover:underline"
                        >
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{lead.company_name}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{lead.role}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {lead.custom_icp || lead.target_icp}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminLeads;
