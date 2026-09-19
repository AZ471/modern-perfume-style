import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/admin/nouveau-produit")({
  component: NouveauProduit,
});

interface SelectedImage {
  id: string;
  file?: File;
  previewUrl: string;
  isUrl?: boolean;
}

// Convert file to Data URL fallback
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

function NouveauProduit() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Parfum Femme",
    type: "Eau de parfum",
    size: "100 ml",
    price: "",
    stock_quantity: "10",
    notes: "",
    description: "",
    badge: "",
  });

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle selecting files from local disk
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const newItems: SelectedImage[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      isUrl: false,
    }));

    setSelectedImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload image file to Supabase Storage or fallback to Data URL
  const uploadImageFile = async (file: File, productId: string, index: number): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `${productId}/${Date.now()}_${index}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("products").getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (err) {
      console.warn("Storage upload warning, fallback to Data URL:", err);
    }

    return await readFileAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Veuillez renseigner le nom du produit.");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Veuillez indiquer un prix valide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Auto-generate clean slug ID from product name
      const productId = formData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);

      // 1. Insert Product into Supabase
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            id: productId,
            name: formData.name,
            category: formData.category,
            type: formData.type || "Eau de parfum",
            size: formData.size || "100 ml",
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity || "10"),
            notes: formData.notes || "",
            description: formData.description || "",
            badge: formData.badge || null,
          },
        ])
        .select()
        .single();

      if (productError) throw productError;

      // 2. Process images
      const finalImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const item = selectedImages[i];
          if (!item) continue;
          if (item.isUrl && item.previewUrl) {
            finalImageUrls.push(item.previewUrl);
          } else if (item.file) {
            const uploadedUrl = await uploadImageFile(item.file, productId, i);
            finalImageUrls.push(uploadedUrl);
          }
        }
      } else {
        // Fallback default image
        finalImageUrls.push("/logo.jpg");
      }

      // 3. Insert into product_images table
      if (finalImageUrls.length > 0 && productData) {
        const imageInserts = finalImageUrls.map((url, index) => ({
          product_id: productData.id,
          image_url: url,
          display_order: index,
        }));

        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (imageError) throw imageError;
      }

      navigate({ to: "/admin/produits" });
    } catch (err: any) {
      if (err?.message?.includes("row-level security")) {
        setError(
          "Erreur Supabase (RLS) : Exécutez 'ALTER TABLE products DISABLE ROW LEVEL SECURITY;' dans Supabase SQL Editor pour autoriser la création de produits."
        );
      } else {
        setError(err.message || "Une erreur s'est produite lors de la sauvegarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/produits">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nouveau Produit</h1>
          <p className="text-gray-500 mt-1">Remplissez les informations du produit et téléversez ses photos.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du produit</CardTitle>
            <CardDescription>Nom, catégorie et prix.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-slate-900">
                Nom du produit *
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Ex: Rose Majestueuse, Oud Noir..."
                value={formData.name}
                onChange={handleChange}
                className="h-11 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold text-slate-900">
                  Prix (FCFA) *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="Ex: 45000"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="h-11 font-bold text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-slate-900">
                  Catégorie *
                </Label>
                <select
                  id="category"
                  name="category"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option>Parfum Femme</option>
                  <option>Parfum Homme</option>
                  <option>Parfum Unisexe</option>
                  <option>Soin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  name="type"
                  placeholder="Eau de parfum, Extrait..."
                  value={formData.type}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Format</Label>
                <Input
                  id="size"
                  name="size"
                  placeholder="100 ml, 50 ml..."
                  value={formData.size}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock initial</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge">Badge (Optionnel)</Label>
              <Input
                id="badge"
                name="badge"
                placeholder="Ex: Best-seller, Nouveau, Édition limitée"
                value={formData.badge}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Description & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Description & Notes Olfactives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes olfactives / Ingrédients</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Ex: Tête : Bergamote | Cœur : Rose | Fond : Ambre"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Présentation et histoire du parfum..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos du produit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-slate-700" />
              <span>Photos du produit</span>
            </CardTitle>
            <CardDescription>Téléversez une ou plusieurs photos du flacon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2"
            >
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
                <Upload className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-900 text-sm">Cliquez pour téléverser vos photos</p>
              <p className="text-xs text-gray-500">Formats supportés : PNG, JPG, WEBP</p>
              <Button type="button" variant="secondary" size="sm" className="mt-1">
                <Plus className="h-4 w-4 mr-1" /> Parcourir les fichiers
              </Button>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {selectedImages.map((img, index) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border-2 border-slate-200 bg-white aspect-square shadow-sm">
                    <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {index === 0 ? "Principale" : `#${index + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-2">
          <Link to="/admin/produits">
            <Button variant="outline" type="button" className="h-12 px-6">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 px-10 h-12 text-base font-bold shadow-lg"
          >
            {loading ? "Publication en cours..." : "Enregistrer & Publier le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
