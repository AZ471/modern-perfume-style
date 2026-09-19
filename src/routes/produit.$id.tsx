import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatPrice } from "@/data/products";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  Sparkles,
  Minus,
  Plus,
  Phone,
  Clock,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      images: product.product_images?.map((img: any) => img.image_url) || [],
    };

    const { data: othersData } = await supabase
      .from("products")
      .select(`
        *,
        product_images (image_url)
      `)
      .neq("id", params.id)
      .limit(4);

    const formattedOthers =
      othersData?.map((p: any) => ({
        ...p,
        images: p.product_images?.map((img: any) => img.image_url) || [],
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

function parseNotes(notesStr?: string) {
  if (!notesStr) return null;
  // Check if format has Tête / Cœur / Fond
  const teteMatch = notesStr.match(/Tête\s*:\s*([^|]+)/i);
  const coeurMatch = notesStr.match(/Cœur\s*:\s*([^|]+)/i);
  const fondMatch = notesStr.match(/Fond\s*:\s*([^|]+)/i);

  if (teteMatch || coeurMatch || fondMatch) {
    return {
      tete: teteMatch?.[1]?.trim() ?? null,
      coeur: coeurMatch?.[1]?.trim() ?? null,
      fond: fondMatch?.[1]?.trim() ?? null,
    };
  }
  return null;
}

function ProductPage() {
  const { product, others } = Route.useLoaderData();
  const { add } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const displayImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : ["/logo.jpg"];

  const currentImage = displayImages[selectedImageIndex] || displayImages[0];
  const parsedPyramid = parseNotes(product.notes);

  const handleAdd = () => {
    add(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Pre-filled WhatsApp order link (Senegal standard)
  const whatsappNumber = "221770000000";
  const whatsappMessage = encodeURIComponent(
    `Bonjour KAG Parfumerie, je souhaite commander ${quantity}x le parfum *${product.name}* (${product.size}) au prix unitaire de ${formatPrice(product.price)}.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Breadcrumbs & back navigation */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 text-xs text-muted-foreground">
          <nav className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <a href="/#collection" className="hover:text-foreground transition-colors">
              {product.category || "Collection"}
            </a>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="font-medium text-foreground truncate max-w-[160px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Partager le produit"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">{copiedLink ? "Lien copié !" : "Partager"}</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
          {/* LEFT: Image Showcase & Gallery (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
            {/* Main Featured Image with Badge */}
            <div className="relative overflow-hidden rounded-md border border-border/80 bg-muted/15 shadow-sm group">
              <img
                src={getOptimizedImageUrl(currentImage, { width: 900, quality: 80 })}
                alt={`${product.name} - image ${selectedImageIndex + 1}`}
                width={900}
                height={1125}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Status Badge */}
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                {product.badge ? (
                  <span className="rounded-none bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                    {product.badge}
                  </span>
                ) : (
                  <span className="rounded-none bg-accent/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground shadow-sm">
                    Signature KAG
                  </span>
                )}
              </div>

              {/* Image Counter if multiple images */}
              {displayImages.length > 1 && (
                <div className="absolute right-3 bottom-3 rounded-full bg-background/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-medium text-foreground shadow-xs">
                  {selectedImageIndex + 1} / {displayImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Strip if multiple images */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {displayImages.map((img: string, idx: number) => {
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 overflow-hidden rounded-xs border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-primary shadow-xs ring-1 ring-primary/40"
                          : "border-border/70 opacity-70 hover:opacity-100 hover:border-foreground/40"
                      }`}
                    >
                      <img
                        src={getOptimizedImageUrl(img, { width: 140, quality: 70 })}
                        alt={`Miniature ${idx + 1}`}
                        width={70}
                        height={88}
                        className="h-16 w-14 sm:h-20 sm:w-16 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Product Buy Box & Luxury Details (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
            {/* Header / Titles */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                  {product.category}
                </p>
                {/* Stock Status Pill */}
                {product.stock_quantity > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                    Rupture temporaire
                  </span>
                )}
              </div>

              <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-foreground">
                {product.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{product.type}</span>
                <span>•</span>
                <span>{product.size}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Haute tenue & sillage raffiné</span>
              </div>
            </div>

            {/* Price section */}
            <div className="border-y border-border/80 py-4">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-muted-foreground">TVA incluse</span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
                <Truck className="size-3.5 shrink-0" />
                <span>Livraison offerte à Dakar · Expédié sous 24h</span>
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {product.description}
              </p>
            )}

            {/* Olfactory Pyramid Sensory Box */}
            {parsedPyramid ? (
              <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  <Sparkles className="size-3.5" /> Pyramide Olfactive
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  {parsedPyramid.tete && (
                    <div className="flex items-start gap-2">
                      <span className="w-20 shrink-0 font-medium text-foreground">Tête :</span>
                      <span className="text-muted-foreground">{parsedPyramid.tete}</span>
                    </div>
                  )}
                  {parsedPyramid.coeur && (
                    <div className="flex items-start gap-2">
                      <span className="w-20 shrink-0 font-medium text-foreground">Cœur :</span>
                      <span className="text-muted-foreground">{parsedPyramid.coeur}</span>
                    </div>
                  )}
                  {parsedPyramid.fond && (
                    <div className="flex items-start gap-2">
                      <span className="w-20 shrink-0 font-medium text-foreground">Fond :</span>
                      <span className="text-muted-foreground">{parsedPyramid.fond}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : product.notes ? (
              <div className="rounded-md border border-border/80 bg-muted/15 p-3.5 text-xs">
                <span className="font-semibold text-foreground">Notes olfactives : </span>
                <span className="text-muted-foreground">{product.notes}</span>
              </div>
            ) : null}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quantité
                </span>
                <div className="flex items-center border border-border bg-card rounded-none">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary Add to Cart Button */}
              <Button
                onClick={handleAdd}
                size="lg"
                className={`h-12 w-full rounded-none uppercase tracking-[0.14em] text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  added
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {added ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="size-4" /> Ajouté au panier !
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="size-4" /> Ajouter au panier — {formatPrice(product.price * quantity)}
                  </span>
                )}
              </Button>

              {/* Direct WhatsApp Ordering (Highly popular in Senegal / Dakar) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-none border border-emerald-600/40 bg-emerald-50/50 text-emerald-800 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-emerald-100/60 transition-colors"
              >
                <Phone className="size-3.5 text-emerald-600" />
                <span>Commander via WhatsApp</span>
              </a>
            </div>

            {/* Reassurance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/80">
              <div className="flex items-start gap-2.5">
                <Truck className="size-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Livraison 24h Dakar</p>
                  <p className="text-[11px] text-muted-foreground">Et 48h dans les régions</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="size-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Paiement à la livraison</p>
                  <p className="text-[11px] text-muted-foreground">Wave, OM ou Espèces</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">100% Authentique</p>
                  <p className="text-[11px] text-muted-foreground">Composants d'exception</p>
                </div>
              </div>
            </div>

            {/* Accordion for Details, Ritual, Shipping */}
            <div className="pt-2">
              <Accordion type="single" collapsible defaultValue="details" className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-xs uppercase tracking-wider font-semibold">
                    Détails & Caractéristiques
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span>Contenance :</span>
                      <span className="font-medium text-foreground">{product.size}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span>Type de produit :</span>
                      <span className="font-medium text-foreground">{product.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span>Catégorie :</span>
                      <span className="font-medium text-foreground">{product.category}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>Tenue :</span>
                      <span className="font-medium text-foreground">Longue durée (8h – 12h)</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ritual">
                  <AccordionTrigger className="text-xs uppercase tracking-wider font-semibold">
                    Rituel d'Application du Parfumeur
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                    Vaporisez le parfum à environ 15-20 centimètres sur les zones de pulsation :
                    le cou, la nuque, le creux des poignets et derrière les oreilles. La chaleur de
                    ces points révélera la complexité des essences tout au long de la journée sans
                    altérer les notes de tête.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-xs uppercase tracking-wider font-semibold">
                    Livraison & Retours au Sénégal
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                    <p>
                      • <strong>Dakar & Banlieue</strong> : Livraison express à domicile ou bureau en 24h.
                    </p>
                    <p>
                      • <strong>Régions (Thiès, Saint-Louis, Mbour, Ziguinchor...)</strong> : Expédition sécurisée en 48h.
                    </p>
                    <p>
                      • <strong>Paiement</strong> : À la réception auprès du coursier (Wave, Orange Money ou Espèces).
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>



        {/* RELATED PRODUCTS SECTION */}
        {others && others.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-border/80 pt-12">
            <div className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                Sélection KAG
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold">
                Vous aimerez aussi
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 sm:gap-x-6 sm:gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* STICKY MOBILE ACTION BAR (Appears on mobile for effortless purchase) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md p-3 sm:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={getOptimizedImageUrl(currentImage, { width: 80, quality: 70 })}
              alt=""
              width={40}
              height={50}
              className="size-10 rounded-xs object-cover border border-border"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
              <p className="text-xs font-bold text-accent">{formatPrice(product.price)}</p>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            className={`h-10 rounded-none px-4 text-xs uppercase tracking-wider font-semibold shrink-0 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
            <span className="ml-1.5">{added ? "Ajouté" : "Ajouter"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
