import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, PackageSearch, ShoppingBag, Users, Store, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="KAG Parfumerie" className="h-10 w-auto rounded-md" />
          <span className="font-serif font-bold text-sm">KAG Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded text-gray-300 hover:text-white focus:outline-none"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-white p-4 flex flex-col justify-between shrink-0 shadow-lg`}
      >
        <div>
          <div className="hidden md:flex justify-center mb-6">
            <img src="/logo.jpg" alt="KAG Parfumerie" className="h-20 w-auto rounded-md" />
          </div>
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Administration</p>
            <p className="text-xs text-amber-400 truncate mt-0.5">{user.email}</p>
          </div>
          <nav className="space-y-1.5">
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              activeProps={{ className: "bg-slate-800 text-white font-semibold" }}
              inactiveProps={{ className: "text-gray-300 hover:bg-slate-800" }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm"
            >
              <LayoutDashboard className="h-4 w-4" /> Tableau de bord
            </Link>
            <Link
              to="/admin/produits"
              onClick={() => setMobileOpen(false)}
              activeProps={{ className: "bg-slate-800 text-white font-semibold" }}
              inactiveProps={{ className: "text-gray-300 hover:bg-slate-800" }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm"
            >
              <PackageSearch className="h-4 w-4" /> Produits
            </Link>
            <Link
              to="/admin/commandes"
              onClick={() => setMobileOpen(false)}
              activeProps={{ className: "bg-slate-800 text-white font-semibold" }}
              inactiveProps={{ className: "text-gray-300 hover:bg-slate-800" }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm"
            >
              <ShoppingBag className="h-4 w-4" /> Commandes
            </Link>
            <Link
              to="/admin/clients"
              onClick={() => setMobileOpen(false)}
              activeProps={{ className: "bg-slate-800 text-white font-semibold" }}
              inactiveProps={{ className: "text-gray-300 hover:bg-slate-800" }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm"
            >
              <Users className="h-4 w-4" /> Clients
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Espaces</p>
              <Link
                to="/client"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sky-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                <User className="h-4 w-4" /> Espace Client
              </Link>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                <Store className="h-4 w-4" /> Voir la boutique
              </Link>
            </div>
          </nav>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors text-sm font-medium text-left"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
