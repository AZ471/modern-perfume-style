import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import hero from "@/assets/hero.jpg";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUREA — Maison de Haute Parfumerie" },
      {
        name: "description",
        content:
          "NUREA — boutique de parfums et soins d'exception. Découvrez nos eaux de parfum, extraits et soins visage composés avec les plus belles matières premières.",
      },
      { property: "og:title", content: "NUREA — Maison de Haute Parfumerie" },
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

const filters = ["Tout", "Parfum Femme", "Parfum Homme", "Soin"] as const;

function Index() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tout");
  const visible =
    filter === "Tout" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="rise-in">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
            Maison de haute parfumerie
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] md:text-7xl">
            L'art du parfum,
            <br />
            <em className="italic text-accent">à la française</em>
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Des compositions rares, distillées lentement, pour une signature qui
            traverse la peau. Parfums, extraits et soins d'exception.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#collection"
              className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Découvrir la collection
            </a>
            <a
              href="#maison"
              className="text-sm font-semibold underline underline-offset-4 decoration-border hover:decoration-accent"
            >
              Notre maison
            </a>
          </div>
          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <span className="font-display text-3xl text-foreground">24</span>
              <br />
              créations
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <span className="font-display text-3xl text-foreground">100%</span>
              <br />
              fait en France
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <span className="font-display text-3xl text-foreground">4,9</span>
              <br />
              avis clients
            </div>
          </div>
        </div>
        <div className="rise-in" style={{ animationDelay: "150ms" }}>
          <div className="overflow-hidden rounded-3xl ring-1 ring-border">
            <img
              src={hero}
              alt="Flacon de parfum NUREA"
              width={1088}
              height={1360}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
                La collection
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Nos essences
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={
                    f === filter
                      ? "rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground"
                      : "rounded-full border border-border px-5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Maison */}
      <section id="maison" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
              La maison
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Composée à Grasse, pensée pour durer
            </h2>
            <p className="mt-6 leading-relaxed text-primary-foreground/70">
              Chaque flacon NUREA naît dans notre atelier de Grasse, berceau de
              la parfumerie française. Nous travaillons en petites séries, avec
              des matières premières sourcées avec exigence, pour des parfums
              qui racontent une histoire sur votre peau.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Truck,
                title: "Livraison offerte",
                text: "Dès 90 € d'achat, partout en France.",
              },
              {
                icon: RotateCcw,
                title: "Retours 30 jours",
                text: "Satisfait ou remboursé, sans condition.",
              },
              {
                icon: ShieldCheck,
                title: "Paiement sécurisé",
                text: "Vos données protégées, toujours.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-primary-foreground/15 p-6"
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
          <Link to="/" className="font-display text-2xl text-foreground">
            NUREA
          </Link>
          <p>Haute parfumerie · Grasse, France</p>
          <p>© 2026 NUREA — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
