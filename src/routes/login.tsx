import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User as UserIcon, LogOut, Store } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect automatically only right after a fresh form submission
  useEffect(() => {
    if (justLoggedIn && user) {
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/client" });
      }
    }
  }, [justLoggedIn, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    
    if (isSignUp) {
      if (!fullName) {
        setError("Veuillez renseigner votre prénom et nom.");
        setLoading(false);
        return;
      }
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });
      
      if (signUpError) {
        setError(signUpError.message);
      } else {
        if (signUpData?.user) {
          try {
            await supabase.from("users").upsert({
              id: signUpData.user.id,
              email: signUpData.user.email || email,
              full_name: fullName,
              phone: phone,
              role: "client"
            });
          } catch (err) {
            console.warn("Erreur lors de l'enregistrement dans la table users:", err);
          }
        }
        setError("Inscription réussie. Vous êtes maintenant connecté.");
        setJustLoggedIn(true);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        setError(signInError.message);
      } else {
        setJustLoggedIn(true);
      }
    }
    
    setLoading(false);
  };

  if (user && !justLoggedIn) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center min-h-[70vh] px-4">
        <Card className="w-full max-w-md text-center p-6 space-y-6 shadow-xl border">
          <div className="flex justify-center">
            <img src="/logo.jpg" alt="KAG Parfumerie" className="h-20 w-auto rounded-md object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif">Vous êtes déjà connecté</CardTitle>
            <p className="mt-2 text-sm text-gray-600">
              Session active : <strong className="text-slate-900">{user.email}</strong>
            </p>
            <div className="mt-2">
              {user.role === "admin" ? (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                  <Shield className="h-3.5 w-3.5 text-amber-700" />
                  Administrateur
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  <UserIcon className="h-3.5 w-3.5 text-slate-600" />
                  Client
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {user.role === "admin" && (
              <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2">
                <Link to="/admin">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span>Accéder au Panneau d'Administration</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-50">
              <Link to="/client">
                <UserIcon className="h-4 w-4" />
                <span>Accéder à l'Espace Client</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full flex items-center justify-center gap-2 text-slate-600">
              <Link to="/">
                <Store className="h-4 w-4" />
                <span>Retour à la boutique</span>
              </Link>
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              onClick={async () => {
                await logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter (changer de compte)</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.jpg" alt="KAG Parfumerie" className="h-20 w-auto rounded-md" />
          </div>
          <CardTitle className="text-2xl font-serif">
            {isSignUp ? "Créer un compte" : "Connexion"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Rejoignez KAG Parfumerie pour suivre vos commandes."
              : "Connectez-vous à votre espace sécurisé."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={error.includes("réussie") ? "default" : "destructive"} className={error.includes("réussie") ? "border-green-500 text-green-700 bg-green-50" : ""}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Prénom et Nom</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ex: Sophie L."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: +221 77 000 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
              {loading ? "Traitement..." : isSignUp ? "S'inscrire" : "Se connecter"}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-sm text-gray-500 hover:text-gray-900" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              disabled={loading}
            >
              {isSignUp ? "Déjà un compte ? Se connecter" : "Créer un compte"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
