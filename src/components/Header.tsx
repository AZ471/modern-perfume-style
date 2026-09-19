import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/kag-parfumerie-logo.jpeg.asset.json";

const navLinks = [
  { label: "Parfums", href: "/#collection" },
  { label: "Soins", href: "/#collection" },
  { label: "La Maison", href: "/#maison" },
];

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 text-primary-foreground backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="KAG Parfumerie — Accueil">
          <img src="/logo.jpg" alt="KAG Parfumerie" className="h-16 w-auto rounded-md object-contain" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
               className="text-primary-foreground/70 transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/panier"
            aria-label="Panier"
            className="relative inline-flex h-10 items-center gap-2 border border-accent/55 px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground mr-2"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "admin" ? (
                <>
                  <Link
                    to="/client"
                    className="hidden md:inline-flex h-9 items-center gap-1.5 px-3 text-xs font-semibold text-primary-foreground/90 transition-colors hover:text-accent border border-primary-foreground/20 rounded-md"
                    title="Accéder à l'espace client"
                  >
                    <UserIcon className="size-3.5" />
                    <span>Espace Client</span>
                  </Link>
                  <Link
                    to="/admin"
                    className="hidden md:inline-flex h-9 items-center gap-1.5 px-3 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-sm"
                    title="Tableau de bord administrateur"
                  >
                    <Shield className="size-3.5 text-amber-950" />
                    <span>Admin</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/client"
                  className="hidden md:inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold text-primary-foreground transition-colors hover:text-accent"
                >
                  <UserIcon className="size-4" />
                  <span>Mon Espace</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-accent"
                title="Se déconnecter"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold text-primary-foreground transition-colors hover:text-accent"
            >
              <UserIcon className="size-4" />
              <span className="hidden sm:inline">Connexion</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-accent md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-primary-foreground/10 bg-primary px-5 py-4 md:hidden space-y-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-primary-foreground/75 hover:text-accent"
            >
              {l.label}
            </a>
          ))}

          <div className="pt-3 border-t border-primary-foreground/15 mt-2 space-y-2">
            {user ? (
              <>
                <p className="text-xs text-primary-foreground/50 truncate px-1">
                  {user.email}
                </p>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 text-sm font-bold text-amber-950 bg-amber-400 rounded-md"
                  >
                    <Shield className="size-4" />
                    <span>Tableau de bord Admin</span>
                  </Link>
                )}
                <Link
                  to="/client"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded-md"
                >
                  <UserIcon className="size-4" />
                  <span>{user.role === "admin" ? "Espace Client" : "Mon Espace"}</span>
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 py-2 px-3 text-sm font-medium text-red-400 hover:bg-primary-foreground/10 rounded-md text-left"
                >
                  <LogOut className="size-4" />
                  <span>Se déconnecter</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 rounded-md"
              >
                <UserIcon className="size-4" />
                <span>Connexion / Inscription</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
