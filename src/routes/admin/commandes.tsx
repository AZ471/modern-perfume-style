import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAllOrders, updateOrderStatus } from "@/lib/orders";
import { formatPrice } from "@/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, Clock, Truck, Package, XCircle, Filter, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/commandes")({
  component: AdminCommandes,
});

export function AdminCommandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrders({ isAdmin: true });
      setCommandes(data);
    } catch (err) {
      console.error("Unexpected error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      setCommandes((prev) =>
        prev.map((c) => (c.id === orderId ? { ...c, status: newStatus } : c))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending": return "En attente de validation";
      case "processing": return "En préparation";
      case "shipped": return "Expédié / En livraison";
      case "delivered": return "Livré";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-300";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending": return "bg-amber-100 text-amber-800 border-amber-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const filteredCommandes = filterStatus === "all"
    ? commandes
    : commandes.filter((c) => c.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Commandes</h1>
          <p className="text-gray-500 mt-1">Validez et suivez les commandes de vos clients en 1 clic.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders} className="text-xs">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {[
          { id: "all", label: `Toutes (${commandes.length})` },
          { id: "pending", label: `En attente (${commandes.filter(c => c.status === "pending").length})` },
          { id: "processing", label: `En préparation (${commandes.filter(c => c.status === "processing").length})` },
          { id: "shipped", label: `Expédiées (${commandes.filter(c => c.status === "shipped").length})` },
          { id: "delivered", label: `Livrées (${commandes.filter(c => c.status === "delivered").length})` },
          { id: "cancelled", label: `Annulées (${commandes.filter(c => c.status === "cancelled").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterStatus === tab.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">N° Commande</th>
                  <th className="px-6 py-4 font-medium">Client & Contact</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Montant</th>
                  <th className="px-6 py-4 font-medium">Statut Actuel</th>
                  <th className="px-6 py-4 font-medium text-right">Changer le statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
                  </tr>
                ) : filteredCommandes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Aucune commande trouvée.</td>
                  </tr>
                ) : (
                  filteredCommandes.map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #{cmd.id.split("-")[0].toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {cmd.shipping_address?.includes("|") ? cmd.shipping_address.split("|")[0].trim() : cmd.users?.full_name || "Client"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cmd.shipping_address?.includes("|") ? cmd.shipping_address.split("|")[1].trim() : cmd.users?.email || "Sans contact"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(cmd.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatPrice(cmd.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(cmd.status)}`}>
                          {translateStatus(cmd.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <select
                            value={cmd.status}
                            onChange={(e) => handleUpdateStatus(cmd.id, e.target.value)}
                            className="text-xs font-semibold border rounded-md px-2 py-1.5 bg-white text-slate-800 shadow-sm cursor-pointer"
                          >
                            <option value="pending">🟡 En attente</option>
                            <option value="processing">🔵 En préparation</option>
                            <option value="shipped">🟣 Expédié</option>
                            <option value="delivered">🟢 Livré</option>
                            <option value="cancelled">🔴 Annulé</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(cmd)}
                            className="text-xs font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Voir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Détails de Commande pour Admin */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Commande #{selectedOrder.id.split("-")[0].toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500">
                  Passée le {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border">
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-700" /> Coordonnées de Livraison
                </p>
                <p className="text-slate-800 font-medium">
                  {selectedOrder.shipping_address || "Livraison Standard"}
                </p>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border">
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-700" /> Articles commandés
                  </p>
                  <div className="space-y-1.5 text-xs divide-y">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center pt-1.5 first:pt-0">
                        <span className="font-medium text-slate-800">{item.name} × {item.quantity}</span>
                        <span className="font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-500 font-medium">Montant Total</span>
                <span className="font-serif text-2xl font-bold text-slate-900">{formatPrice(selectedOrder.total_amount)}</span>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900">Changer le statut en 1 clic :</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedOrder.status === "processing" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                    className="text-xs"
                  >
                    🔵 En préparation
                  </Button>
                  <Button
                    type="button"
                    variant={selectedOrder.status === "shipped" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                    className="text-xs"
                  >
                    🟣 Expédier
                  </Button>
                  <Button
                    type="button"
                    variant={selectedOrder.status === "delivered" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    🟢 Marquer Livrée
                  </Button>
                  <Button
                    type="button"
                    variant={selectedOrder.status === "cancelled" ? "destructive" : "outline"}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                    className="text-xs"
                  >
                    🔴 Annuler
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button onClick={() => setSelectedOrder(null)} className="bg-slate-900 text-white">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
