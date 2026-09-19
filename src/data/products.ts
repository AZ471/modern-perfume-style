export type Product = {
  id: string;
  name: string;
  category: "Parfum Femme" | "Parfum Homme" | "Parfum Unisexe" | "Soin" | string;
  type: string;
  size: string;
  price: number;
  stock_quantity: number;
  notes: string;
  description: string;
  images: string[];
  badge?: string;
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(price).replace("XOF", "FCFA");

export const defaultProducts: Product[] = [
  {
    id: "bleu-riviera-absolu-888",
    name: "Bleu Riviera Absolu",
    category: "Parfum Unisexe",
    type: "Eau de parfum",
    size: "100 ml",
    price: 45000,
    stock_quantity: 15,
    notes: "Tête : Citron d'Amalfi, Menthe Sauvage, Bergamote | Cœur : Brise Marine, Néroli | Fond : Cèdre de l'Atlas, Vétiver",
    description: "Inspiré par la transparence cristalline de la bouteille. Un souffle vivifiant d'agrumes méditerranéens ancré dans la noblesse boisée du cèdre.",
    badge: "Nouveau",
    images: [
      "https://phnbjniebdxwxqcenudj.supabase.co/storage/v1/object/public/products/bleu-riviera-absolu-888/1789835395583_0.jpg",
    ],
  },
  {
    id: "rose-majestueux-189",
    name: "Rose majestueux",
    category: "Parfum Femme",
    type: "Eau de parfum",
    size: "100 ml",
    price: 15000,
    stock_quantity: 10,
    notes: "Notes florales délicates et accents précieux",
    description: "Une fragrance féminine et gracieuse, alliant la fraîcheur des pétales de rose à des notes douces et enveloppantes.",
    badge: "Populaire",
    images: [
      "https://phnbjniebdxwxqcenudj.supabase.co/storage/v1/object/public/products/rose-majestueux-189/1789835703498_0.jpg",
      "https://phnbjniebdxwxqcenudj.supabase.co/storage/v1/object/public/products/rose-majestueux-189/1789835710671_1.jpg",
    ],
  },
];

