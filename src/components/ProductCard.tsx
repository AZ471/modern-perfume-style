import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group">
      <Link
        to="/produit/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden rounded-2xl bg-card ring-1 ring-border"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
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
      <button
        onClick={() => add(product.id)}
        className="mt-3 w-full rounded-full border border-foreground/20 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        Ajouter au panier
      </button>
    </article>
  );
}
