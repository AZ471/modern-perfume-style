import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/data/products";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Votre panier — NUREA" },
      { name: "description", content: "Votre panier NUREA." },
      { property: "og:title", content: "Votre panier — NUREA" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, total, setQty, remove, clear, productFor } = useCart();
  const [ordered, setOrdered] = useState(false);

  const shipping = total >= 90 || total === 0 ? 0 : 6.9;

  if (ordered) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-32 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-accent/20">
            <ShoppingBag className="size-7 text-accent" />
          </div>
          <h1 className="mt-6 font-display text-4xl">Merci pour votre commande !</h1>
          <p className="mt-4 text-muted-foreground">
            Votre commande a bien été enregistrée. Vous recevrez un e-mail de
            confirmation avec le suivi de livraison.
          </p>
          <Link
            to="/"
            className="mt-8 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Retour à la boutique
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <h1 className="font-display text-4xl md:text-5xl">Votre panier</h1>

        {lines.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Votre panier est vide.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              {lines.map((line) => {
                const p = productFor(line.productId);
                if (!p) return null;
                return (
                  <div
                    key={line.productId}
                    className="flex gap-5 rounded-2xl bg-card p-4 ring-1 ring-border"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      width={1024}
                      height={1280}
                      loading="lazy"
                      className="size-24 rounded-xl object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg leading-tight">
                            {p.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {p.type} · {p.size}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(line.productId)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Retirer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                          <button
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            className="grid size-6 place-items-center"
                            aria-label="Diminuer"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-4 text-center text-sm font-semibold">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            className="grid size-6 place-items-center"
                            aria-label="Augmenter"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <p className="font-display text-lg font-semibold">
                          {formatPrice(p.price * line.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl bg-card p-6 ring-1 ring-border">
              <h2 className="font-display text-2xl">Récapitulatif</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sous-total</dt>
                  <dd className="font-medium">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd className="font-medium">
                    {shipping === 0 ? "Offerte" : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-xl font-semibold">
                    {formatPrice(total + shipping)}
                  </dd>
                </div>
              </dl>
              {shipping > 0 && (
                <p className="mt-3 rounded-lg bg-accent/15 px-3 py-2 text-xs text-foreground">
                  Plus que {formatPrice(90 - total)} pour la livraison offerte !
                </p>
              )}
              <button
                onClick={() => {
                  setOrdered(true);
                  clear();
                }}
                className="mt-6 w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Passer commande
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Paiement sécurisé · Retours 30 jours
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
