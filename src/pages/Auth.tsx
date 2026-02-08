import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart3, Mail, Lock, User, Eye, EyeOff, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  role: z.enum(["investisseur", "regulateur"]),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("investisseur");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const parsed = loginSchema.parse({ email, password });
        const { error } = await signIn(parsed.email, parsed.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({ title: "Erreur", description: "Email ou mot de passe incorrect.", variant: "destructive" });
          } else if (error.message.includes("Email not confirmed")) {
            toast({ title: "Email non confirmé", description: "Veuillez vérifier votre boîte mail et confirmer votre adresse email.", variant: "destructive" });
          } else {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
          }
        } else {
          navigate("/");
        }
      } else {
        const parsed = signupSchema.parse({ email, password, fullName, role: selectedRole });
        const { error } = await signUp(parsed.email, parsed.password, parsed.fullName, parsed.role as AppRole);
        if (error) {
          if (error.message.includes("already registered") || error.message.includes("already been registered")) {
            toast({ title: "Compte existant", description: "Un compte avec cet email existe déjà. Essayez de vous connecter.", variant: "destructive" });
          } else {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
          }
        } else {
          toast({
            title: "Inscription réussie !",
            description: "Vérifiez votre email pour confirmer votre compte.",
          });
          setIsLogin(true);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation", description: err.errors[0].message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-primary/10 p-2.5 rounded-xl glow-primary">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Carthage Market Intelligence</h1>
            <p className="text-xs text-muted-foreground">Analyse de Sentiment du Marché Tunisien</p>
          </div>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {isLogin ? "Connexion" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Connectez-vous pour accéder au dashboard"
                : "Inscrivez-vous pour commencer l'analyse"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Votre nom complet"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>Vous êtes</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole("investisseur")}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                          selectedRole === "investisseur"
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/50 hover:border-primary/30 text-muted-foreground"
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">Investisseur</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("regulateur")}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                          selectedRole === "regulateur"
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/50 hover:border-primary/30 text-muted-foreground"
                        }`}
                      >
                        <Shield className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">Régulateur (CMF)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Chargement..."
                  : isLogin
                    ? "Se connecter"
                    : "Créer le compte"
                }
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail("");
                  setPassword("");
                  setFullName("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
