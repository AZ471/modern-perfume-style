import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { products, formatPrice } from "@/data/products";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/produit/$id")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name} — KAG Parfumerie` },
      { name: "description", content: loaderData?.product.description ?? "" },
      { property: "og:title", content: `${loaderData?.product.name} — KAG Parfumerie` },
      {
        property: "og:description",
        content: loaderData?.product.description ?? "",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const others = products.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    add(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Retour à la collection
        </Link>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden ring-1 ring-border">
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="rise-in">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {product.category}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {product.type} · {product.size}
            </p>

            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted-foreground">Notes olfactives</dt>
                <dd className="font-medium">{product.notes}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted-foreground">Format</dt>
                <dd className="font-medium">{product.size}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted-foreground">Fabrication</dt>
                <dd className="font-medium">Grasse, France</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <span className="font-display text-4xl font-semibold">
                {formatPrice(product.price)}
              </span>
              <Button
                onClick={handleAdd}
                className="h-12 rounded-none px-8 uppercase tracking-[0.1em]"
              >
                {added ? (
                  <>
                    <Check className="size-4" /> Ajouté !
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" /> Ajouter au panier
                  </>
                )}
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Livraison offerte dès 90 € · Retours sous 30 jours · Paiement
              sécurisé
            </p>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-display text-3xl">Vous aimerez aussi</h2>
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
