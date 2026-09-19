import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatPrice } from "@/data/products";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getOptimizedImageUrl } from "@/lib/images";

export const Route = createFileRoute("/produit/$id")({
  loader: async ({ params }) => {
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (image_url)
      `)
      .eq("id", params.id)
      .single();

    if (error || !product) throw notFound();

    const formattedProduct = {
      ...product,
      images: product.product_images?.map((img: any) => img.image_url) || []
    };

    const { data: othersData } = await supabase
      .from("products")
      .select(`
        *,
        product_images (image_url)
      `)
      .neq("id", params.id)
      .limit(3);

    const formattedOthers = othersData?.map((p: any) => ({
      ...p,
      images: p.product_images?.map((img: any) => img.image_url) || []
    })) || [];

    return { product: formattedProduct, others: formattedOthers };
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
  const { product, others } = Route.useLoaderData();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const displayImages = (product.images && product.images.length > 0)
    ? product.images
    : ["/logo.jpg"];

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
          <div className="flex flex-col gap-4">
            {displayImages.map((img: string, i: number) => (
              <div key={i} className="overflow-hidden ring-1 ring-border rounded-lg shadow-sm">
                <img
                  src={getOptimizedImageUrl(img, { width: 800, quality: 80 })}
                  alt={`${product.name} - vue ${i + 1}`}
                  width={800}
                  height={1000}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ))}
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
          </div>
        </div>

        <section className="mt-16 sm:mt-24">
          <h2 className="font-display text-2xl sm:text-3xl">Vous aimerez aussi</h2>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-2.5 gap-y-5 sm:gap-x-6 sm:gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
