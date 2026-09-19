import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl } from "@/lib/images";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useCart();

  const rawImage = (product.images && product.images.length > 0 && product.images[0])
    ? product.images[0]
    : "/logo.jpg";

  const optimizedSrc = getOptimizedImageUrl(rawImage, { width: 500, quality: 75 });

  return (
    <article className="group">
      <Link
        to="/produit/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden bg-card ring-1 ring-border"
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
          <span className="absolute left-3 top-3 bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </p>
          <Link
            to="/produit/$id"
            params={{ id: product.id }}
            className="mt-1 block font-display text-xl leading-tight hover:text-accent"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {product.type} · {product.size}
          </p>
        </div>
        <p className="font-display text-lg font-semibold">
          {formatPrice(product.price)}
        </p>
      </div>
       <Button
         variant="outline"
        onClick={() => add(product.id)}
         className="mt-3 h-11 w-full rounded-none border-foreground/20 uppercase tracking-[0.12em] hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        Ajouter au panier
       </Button>
    </article>
  );
}
