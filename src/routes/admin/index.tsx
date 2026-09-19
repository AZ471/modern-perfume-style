import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAllOrders } from "@/lib/orders";
import { formatPrice } from "@/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coins, ShoppingBag, TrendingUp, PackageSearch } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    clientsCount: 0,
    recentOrders: [] as any[],
    products: [] as any[],
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate({ to: "/login", replace: true });
      return;
    }

    async function fetchStats() {
      // Fetch Orders (merged Supabase + Local)
      const orders = await fetchAllOrders({ isAdmin: true });

      // Fetch Clients
      const { data: clients } = await supabase
        .from("users")
        .select("*")
        .eq("role", "client");

      // Fetch Products
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("stock_quantity", { ascending: true })
        .limit(4);

      const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
      setStats({
        revenue,
        ordersCount: (orders || []).length,
        clientsCount: clients?.length || 0,
        recentOrders: (orders || []).slice(0, 5),
        products: products || [],
      });
    }

    fetchStats();
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "processing": return "En préparation";
      case "shipped": return "Expédié";
      case "delivered": return "Livré";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vue d'ensemble</h1>
          <p className="text-gray-500 mt-1">Gérez votre boutique et consultez les statistiques en temps réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">Depuis la création</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
            <p className="text-xs text-muted-foreground">Commandes totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientsCount}</div>
            <p className="text-xs text-muted-foreground">Comptes clients inscrits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Bientôt disponible</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Dernières commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune commande récente.</p>
              ) : stats.recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3 last:border-0 hover:bg-gray-50 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.id.split('-')[0].toUpperCase()}... <span className="text-gray-400 font-normal ml-2">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span></p>
                      <p className="text-sm text-gray-500">{order.users?.full_name || 'Client Inconnu'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(order.total_amount)}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      order.status === "shipped" ? "bg-green-100 text-green-800" : 
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {translateStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>État du stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.products.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun produit.</p>
              ) : stats.products.map((prod, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center">
                      <PackageSearch className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{prod.name}</p>
                      <p className="text-xs text-gray-500">{prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${prod.stock_quantity === 0 ? "text-red-500" : "text-gray-600"}`}>
                      {prod.stock_quantity === 0 ? "Rupture" : `${prod.stock_quantity} en stock`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
