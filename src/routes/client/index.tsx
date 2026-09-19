import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAllOrders } from "@/lib/orders";
import { formatPrice } from "@/data/products";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Clock, Heart, Store, Eye, CheckCircle2, Truck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/client/")({
  component: ClientDashboard,
});

function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", replace: true });
      return;
    }

    if (user) {
      async function loadOrders() {
        setLoading(true);
        const list = await fetchAllOrders({ userId: user?.id });
        setOrders(list);
        setLoading(false);
      }
      
      loadOrders();
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) return null;

  const pendingOrders = orders.filter(o => ["pending", "processing", "shipped"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "delivered");

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending": return "En attente de validation";
      case "processing": return "En préparation";
      case "shipped": return "Expédiée / En livraison";
      case "delivered": return "Livrée";
      case "cancelled": return "Annulée";
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

  return (
    <div className="space-y-6">
      {user.role === "admin" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="bg-amber-700 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Mode Admin
            </span>
            <p className="text-sm font-medium">
              Vous visualisez actuellement l'espace client avec votre compte administrateur.
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-md transition-colors"
          >
            Tableau de bord Admin →
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Bienvenue, {user.email}</h1>
          <p className="text-gray-500 mt-1">Suivez l'état de vos commandes et vos informations personnelles.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors"
        >
          <Store className="h-4 w-4" />
          <span>Accéder à la boutique</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">Livraison(s) en préparation ou expédition</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Historique d'achats</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Commandes livrées avec succès</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Parfums sauvegardés</p>
          </CardContent>
        </Card>
      </div>
      
      {/* List of Orders */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-serif font-bold text-slate-900">Mes Commandes</h2>

        {loading ? (
          <p className="text-gray-500">Chargement de votre historique...</p>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden border shadow-sm hover:shadow transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-mono font-bold text-lg text-slate-900">
                          Commande #{order.id.split("-")[0].toUpperCase()}
                        </p>
                        <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadgeClass(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Passée le {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <p className="font-serif text-2xl font-bold text-slate-900">
                        {formatPrice(order.total_amount)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Eye className="size-3.5" />
                        <span>Détails</span>
                      </Button>
                    </div>
                  </div>

                  {/* Visual Status Progress Bar */}
                  {order.status !== "cancelled" && (
                    <div className="pt-4">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                        <span className={["pending", "processing", "shipped", "delivered"].includes(order.status) ? "text-slate-900 font-bold" : ""}>
                          1. Validée
                        </span>
                        <span className={["processing", "shipped", "delivered"].includes(order.status) ? "text-blue-700 font-bold" : ""}>
                          2. En préparation
                        </span>
                        <span className={["shipped", "delivered"].includes(order.status) ? "text-purple-700 font-bold" : ""}>
                          3. En livraison
                        </span>
                        <span className={order.status === "delivered" ? "text-emerald-700 font-bold" : ""}>
                          4. Livrée
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div className={`h-full transition-all duration-500 ${
                          order.status === "delivered" ? "w-full bg-emerald-600" :
                          order.status === "shipped" ? "w-3/4 bg-purple-600" :
                          order.status === "processing" ? "w-1/2 bg-blue-600" : "w-1/4 bg-amber-500"
                        }`} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold mb-1">Vous n'avez pas encore passé de commande.</p>
              <p className="text-xs text-slate-500 mb-6">Découvrez notre collection de parfums & soins d'exception.</p>
              <Link to="/" className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-semibold text-white shadow hover:bg-slate-800">
                Parcourir la collection
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Détails Commande Client */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
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

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Statut de la commande</span>
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {translateStatus(selectedOrder.status)}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-b py-3">
                <span className="text-gray-700 font-semibold">Montant Total</span>
                <span className="font-serif text-2xl font-bold text-slate-900">{formatPrice(selectedOrder.total_amount)}</span>
              </div>

              {selectedOrder.shipping_address && (
                <div className="bg-slate-50 p-3.5 rounded-xl border text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block">Adresse & Contact de Livraison :</span>
                  <p>{selectedOrder.shipping_address}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedOrder(null)} className="bg-slate-900 text-white w-full">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
