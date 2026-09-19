import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Edit } from "lucide-react";

export const Route = createFileRoute("/admin/clients")({
  component: AdminClients,
});

function AdminClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          orders (id, total_amount)
        `)
        .eq("role", "client")
        .order("created_at", { ascending: false });

      if (data && !error) {
        // Aggregate orders per client
        const aggregated = data.map((client: any) => {
          const totalSpent = client.orders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
          return {
            ...client,
            orderCount: client.orders.length,
            totalSpent
          };
        });
        setClients(aggregated);
      }
      setLoading(false);
    }
    fetchClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-gray-500 mt-1">Base de données de vos clients.</p>
        </div>
        <Button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800">
          <UserPlus className="h-4 w-4" /> Ajouter un client
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-center">Commandes</th>
                  <th className="px-6 py-4 font-medium">Total Dépensé</th>
                  <th className="px-6 py-4 font-medium">Inscription</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Aucun client trouvé.</td>
                  </tr>
                ) : clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {(client.full_name || 'I').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">{client.full_name || 'Client Inconnu'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-900">{client.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 font-medium">
                        {client.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {formatPrice(client.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(client.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
