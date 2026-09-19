import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/client")({
  beforeLoad: () => {},
  component: ClientLayout,
});

function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner / Header for Espace Client */}
      <div className="bg-white border-b px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="KAG Parfumerie" className="h-10 w-auto rounded-md object-contain" />
            <span className="font-serif font-bold text-lg hidden sm:inline">KAG Parfumerie</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-2 rounded-md transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-amber-700" />
                <span className="hidden sm:inline">Panneau</span> Admin
              </Link>
            )}

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3 sm:px-4 py-2 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Boutique</span>
            </Link>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
