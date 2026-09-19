import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import hero from "@/assets/hero.jpg";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { defaultProducts } from "@/data/products";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (image_url)
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((p: any) => {
          const fetchedImgs = p.product_images?.map((img: any) => img.image_url) || [];
          return {
            ...p,
            images: fetchedImgs.length > 0 ? fetchedImgs : ["/logo.jpg"],
          };
        });
      }
    } catch (err) {
      console.warn("SSR loader fetch error, using default products:", err);
    }
    return defaultProducts;
  },
  head: () => ({
    meta: [
      { title: "KAG Parfumerie — Parfums & soins d'exception" },
      {
        name: "description",
        content:
          "KAG Parfumerie — une sélection raffinée de parfums et soins pour femme et homme.",
      },
      { property: "og:title", content: "KAG Parfumerie — Parfums & soins d'exception" },
      {
        property: "og:description",
        content:
          "Parfums et soins d'exception, composés avec les plus belles matières premières.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const filters = ["Tout", "Parfum Femme", "Parfum Homme", "Soin", "Parfum Unisexe"] as const;

function Index() {
  const loaderProducts = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("Tout");
  const [products, setProducts] = useState<any[]>(loaderProducts || defaultProducts);
  const [loading, setLoading] = useState(false);

  // Background refresh to pick up fresh inventory smoothly without blocking UI
  useEffect(() => {
    async function refreshProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_images (image_url)
          `)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const formattedProducts = data.map((p: any) => {
            const fetchedImgs = p.product_images?.map((img: any) => img.image_url) || [];
            return {
              ...p,
              images: fetchedImgs.length > 0 ? fetchedImgs : ["/logo.jpg"],
            };
          });
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.warn("Background refresh warning:", err);
      }
    }
    refreshProducts();
  }, []);

  const visible = filter === "Tout" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative min-h-[calc(100svh-8rem)] overflow-hidden bg-primary text-primary-foreground sm:min-h-[calc(100svh-5rem)]">
        <img
          src={hero}
          alt="Flacon de parfum KAG Parfumerie"
          fetchPriority="high"
          decoding="async"
          width={1400}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/10" />
        <div className="relative mx-auto flex min-h-[calc(100svh-8rem)] max-w-7xl items-center px-5 py-12 sm:min-h-[calc(100svh-5rem)] sm:py-16 lg:px-8">
          <div className="rise-in max-w-2xl">
            <img
              src="/logo.jpg"
              alt="KAG Parfumerie"
              fetchPriority="high"
              decoding="async"
              width={320}
              height={160}
              className="mb-8 h-32 w-auto rounded-md object-contain sm:h-40"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">L’élégance en signature</p>
            <h1 className="mt-5 font-display text-5xl leading-none sm:text-6xl md:text-7xl">KAG Parfumerie</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              Des parfums de caractère et des soins précieux, choisis pour révéler une présence qui ne ressemble qu’à vous.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-none bg-accent px-7 uppercase tracking-[0.12em] text-accent-foreground hover:bg-accent/90">
                <a href="#collection">Découvrir la collection</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-none border-primary-foreground/45 bg-transparent px-7 uppercase tracking-[0.12em] text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <a href="#maison">Notre univers</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
                La collection
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                La sélection KAG
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <Button
                  variant={f === filter ? "default" : "outline"}
                  key={f}
                  onClick={() => setFilter(f)}
                  className="h-9 rounded-none px-5 text-[12px] uppercase tracking-[0.08em]"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
            </div>
          ) : visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, index) => (
                <ProductCard key={p.id} product={p} priority={index < 2} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Aucun produit trouvé dans cette catégorie.
            </div>
          )}
        </div>
      </section>

      {/* Maison */}
      <section id="maison" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
              La maison
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Le parfum comme expression de soi
            </h2>
            <p className="mt-6 leading-relaxed text-primary-foreground/70">
              KAG Parfumerie réunit des fragrances et des soins choisis avec exigence.
              Une collection pensée pour chaque personnalité, chaque allure et
              chaque moment précieux.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Truck,
                title: "Livraison rapide",
                text: "Expédition soigneuse de toutes vos commandes.",
              },
              {
                icon: RotateCcw,
                title: "Satisfaction garantie",
                text: "Une qualité et un soin d'exception assurés.",
              },
              {
                icon: ShieldCheck,
                title: "Paiement sécurisé",
                text: "Vos transactions et données protégées.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-primary-foreground/15 p-6"
              >
                <f.icon className="size-6 text-accent" />
                <h3 className="mt-4 font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-sm text-primary-foreground/60">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-display text-xl text-foreground">
            <img src="/logo.jpg" alt="KAG Parfumerie" className="h-10 w-auto rounded-md object-contain" /> 
          </Link>
          <p>Parfums · Soins · Élégance</p>
          <p>© 2026 KAG Parfumerie — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
