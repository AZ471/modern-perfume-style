import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/kag-parfumerie-logo.jpeg.asset.json";

const navLinks = [
  { label: "Parfums", href: "/#collection" },
  { label: "Soins", href: "/#collection" },
  { label: "La Maison", href: "/#maison" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 text-primary-foreground backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="KAG Parfumerie — Accueil">
          <img src={logoAsset.url} alt="" className="size-14 rounded-full object-cover" />
          <span className="hidden font-display text-xl uppercase tracking-[0.16em] sm:inline">KAG Parfumerie</span>
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
            className="relative inline-flex h-10 items-center gap-2 border border-accent/55 px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
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
        <nav className="border-t border-primary-foreground/10 bg-primary px-5 py-4 md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-primary-foreground/75"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
