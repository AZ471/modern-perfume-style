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
