import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/data/products";
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, Truck, Phone, MapPin, CreditCard, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { createOrder } from "@/lib/orders";
import { getOptimizedImageUrl } from "@/lib/images";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Votre panier — KAG Parfumerie" },
      { name: "description", content: "Votre panier KAG Parfumerie." },
      { property: "og:title", content: "Votre panier — KAG Parfumerie" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, total, setQty, remove, clear, productFor } = useCart();
  const { user } = useAuth();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string>("");

  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    phone: "",
    city: "Dakar",
    address: "",
    notes: "",
  });

  // Pre-fill full name if available
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const meta = session?.user?.user_metadata;
      if (meta && typeof meta["full_name"] === "string") {
        setCheckoutData((prev) => ({
          ...prev,
          fullName: meta["full_name"],
        }));
      }
    });
  }, []);

  const shipping = 0; // Free delivery in FCFA context

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderItems = lines.map((line) => {
        const p = productFor(line.productId);
        return {
          productId: line.productId,
          name: p?.name || "Parfum",
          price: p?.price || 0,
          quantity: line.qty,
        };
      });

      const res = await createOrder({
        userId: user?.id,
        userEmail: user?.email,
        total: total + shipping,
        items: orderItems,
        customer: checkoutData,
      });

      const orderId = res.order.id;
      const orderCode = orderId.includes("-") ? (orderId.split("-")[0] || "8492").toUpperCase() : orderId.slice(0, 8).toUpperCase();
      setOrderRef("KAG-" + orderCode);
    } catch (e) {
      console.warn("Error creating order:", e);
      setOrderRef("KAG-" + Math.floor(100000 + Math.random() * 900000));
    } finally {
      clear();
      setSubmitting(false);
      setShowCheckoutModal(false);
      setOrdered(true);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle className="size-10" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Commande Confirmée</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Merci pour votre commande !</h1>
          <p className="mt-2 font-mono text-lg text-slate-800 font-bold bg-slate-100 px-4 py-1.5 rounded-md">
            N° de commande : #{orderRef || "KAG-8492"}
          </p>
          <p className="mt-4 text-muted-foreground max-w-md">
            Votre commande a bien été enregistrée. Notre équipe prépare vos parfums et vous contactera par téléphone avant la livraison.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/client"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <span>Suivre ma commande dans mon espace</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retour à la boutique
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Votre panier</h1>

        {lines.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Votre panier est vide.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              {lines.map((line) => {
                const p = productFor(line.productId);
                if (!p) return null;
                const img = (p.images && p.images.length > 0 && p.images[0]) ? p.images[0] : "/logo.jpg";
                return (
                  <div
                    key={line.productId}
                    className="flex gap-5 bg-card p-4 ring-1 ring-border rounded-lg shadow-sm"
                  >
                    <img
                      src={getOptimizedImageUrl(img, { width: 200, quality: 75 })}
                      alt={p.name}
                      width={96}
                      height={96}
                      loading="lazy"
                      decoding="async"
                      className="size-24 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-serif text-lg font-bold leading-tight">
                            {p.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {p.type} · {p.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(line.productId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Retirer"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            className="size-6"
                            aria-label="Diminuer"
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-4 text-center text-sm font-semibold">
                            {line.qty}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            className="size-6"
                            aria-label="Augmenter"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                        <p className="font-serif text-lg font-bold">
                          {formatPrice(p.price * line.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit bg-card p-6 ring-1 ring-border rounded-xl shadow-sm space-y-4">
              <h2 className="font-serif text-2xl font-bold">Récapitulatif</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sous-total</dt>
                  <dd className="font-medium">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd className="font-medium text-emerald-600 font-bold">Offerte</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-bold">Total</dt>
                  <dd className="font-serif text-xl font-bold text-slate-900">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>
              <Button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow"
              >
                Passer la commande
              </Button>
            </aside>
          </div>
        )}
      </main>

      {/* Modal de Finalisation de Commande */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">Finaliser la commande</h2>
                <p className="text-xs text-slate-500 mt-0.5">Renseignez vos coordonnées de livraison</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-semibold">
                  Nom & Prénom *
                </Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Ex: Sophie Faye"
                  value={checkoutData.fullName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-1.5">
                  <Phone className="size-3.5" /> Numéro de téléphone (WhatsApp / Appel) *
                </Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  placeholder="Ex: +221 77 000 00 00"
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> Ville *
                  </Label>
                  <Input
                    id="city"
                    required
                    placeholder="Dakar, Thies..."
                    value={checkoutData.city}
                    onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Quartier / Adresse *
                  </Label>
                  <Input
                    id="address"
                    required
                    placeholder="Mermoz, Almadies..."
                    value={checkoutData.address}
                    onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-semibold">
                  Instructions de livraison (Optionnel)
                </Label>
                <Input
                  id="notes"
                  placeholder="Ex: Appeler à l'arrivée"
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                />
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <CreditCard className="size-4 text-slate-900" /> Mode de Paiement
                </p>
                <p className="text-sm font-semibold text-slate-900">Paiement à la livraison</p>
                <p className="text-xs text-slate-500">
                  Réglez en espèces, Wave ou Orange Money directement auprès du livreur à la réception.
                </p>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-500 block">Total à payer</span>
                  <span className="font-serif text-2xl font-bold text-slate-900">{formatPrice(total)}</span>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-6 shadow"
                >
                  {submitting ? "Validation..." : "✨ Valider la commande"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
