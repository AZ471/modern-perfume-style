import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl } from "@/lib/images";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const rawImage = (product.images && product.images.length > 0 && product.images[0])
    ? product.images[0]
    : "/logo.jpg";

  const optimizedSrc = getOptimizedImageUrl(rawImage, { width: 500, quality: 75 });

  return (
    <article className="group flex h-full flex-col justify-between rounded-sm sm:rounded-md bg-card p-2 sm:p-3 ring-1 ring-border/60 transition-all duration-300 hover:ring-accent/50 hover:shadow-sm">
      <Link
        to="/produit/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden rounded-xs bg-muted/20"
      >
        <img
          src={optimizedSrc}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          width={500}
          height={625}
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5 rounded-none bg-primary/95 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-xs backdrop-blur-xs">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="mt-2.5 sm:mt-3 flex flex-1 flex-col justify-between">
        <div>
          <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] sm:tracking-[0.2em] text-accent truncate">
            {product.category}
          </p>
          <Link
            to="/produit/$id"
            params={{ id: product.id }}
            className="mt-1 block font-display text-sm sm:text-base md:text-xl font-medium leading-snug line-clamp-1 hover:text-accent transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground truncate">
            {product.type} · {product.size}
          </p>
        </div>

        <div className="mt-2 sm:mt-3">
          <p className="font-display text-sm sm:text-base md:text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className={`mt-2 sm:mt-3 h-8 sm:h-10 w-full rounded-none border-foreground/20 text-[10px] sm:text-xs uppercase tracking-[0.1em] font-medium transition-all duration-200 ${
              added
                ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white"
                : "hover:border-primary hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {added ? (
              <span className="flex items-center justify-center gap-1">
                <Check className="size-3 sm:size-3.5" />
                <span>Ajouté</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <ShoppingBag className="size-3 sm:size-3.5" />
                <span>Ajouter</span>
                <span className="hidden sm:inline">au panier</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
