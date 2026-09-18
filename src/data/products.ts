import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

export type Product = {
  id: string;
  name: string;
  category: "Parfum Femme" | "Parfum Homme" | "Soin";
  type: string;
  size: string;
  price: number;
  notes: string;
  description: string;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "vanille-absolue",
    name: "Vanille Absolue",
    category: "Parfum Femme",
    type: "Eau de parfum",
    size: "100 ml",
    price: 145,
    notes: "Vanille bourbon, fève tonka, santal",
    description:
      "Une vanille profonde et crémeuse, relevée d'une pointe de santal chaud. Un sillage enveloppant qui dure toute la journée.",
    image: p1,
    badge: "Best-seller",
  },
  {
    id: "rose-eclat",
    name: "Rose Éclat",
    category: "Parfum Femme",
    type: "Eau de parfum",
    size: "100 ml",
    price: 128,
    notes: "Rose de mai, pivoine, musc blanc",
    description:
      "Un bouquet floral lumineux et délicat. La rose de mai rencontre la pivoine dans un accord frais et pétillant.",
    image: p2,
  },
  {
    id: "valiant",
    name: "Valiant",
    category: "Parfum Homme",
    type: "Eau de parfum",
    size: "100 ml",
    price: 135,
    notes: "Vétiver, cèdre, poivre noir",
    description:
      "Un boisé puissant et affirmé. Le vétiver fumé et le cèdre composent une signature masculine intemporelle.",
    image: p3,
  },
  {
    id: "jour",
    name: "Jour",
    category: "Parfum Femme",
    type: "Eau de parfum",
    size: "100 ml",
    price: 160,
    notes: "Fleur d'oranger, ambre, miel",
    description:
      "Un rayon de soleil en flacon. La fleur d'oranger et l'ambre doré évoquent les matinées lumineuses de la Méditerranée.",
    image: p4,
    badge: "Nouveau",
  },
  {
    id: "creme-eclat",
    name: "Crème Éclat Visage",
    category: "Soin",
    type: "Crème hydratante",
    size: "50 ml",
    price: 78,
    notes: "Acide hyaluronique, extrait de rose",
    description:
      "Une crème fondante qui hydrate intensément et redonne à la peau son éclat naturel. Texture soyeuse, absorption rapide.",
    image: p5,
  },
  {
    id: "serum-verite",
    name: "Sérum Vérité",
    category: "Soin",
    type: "Sérum régénérant",
    size: "30 ml",
    price: 95,
    notes: "Huile précieuse, vitamine E",
    description:
      "Un élixir concentré qui illumine, raffermit et régénère la peau nuit après nuit. Quelques gouttes suffisent.",
    image: p6,
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
