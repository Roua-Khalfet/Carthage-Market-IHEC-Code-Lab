import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { RiskQuiz } from "@/components/auth/RiskQuiz";
import { useAuth, type RiskProfile } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Quiz = () => {
  const { saveQuizResult } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleComplete = async (profile: RiskProfile, answers: number[], score: number) => {
    const result = await saveQuizResult(profile, answers, score);
    if (result?.error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le résultat du quiz.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil enregistré !",
        description: `Votre profil investisseur : ${profile}`,
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="bg-primary/10 p-2 rounded-xl glow-primary">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Profil Investisseur</h1>
          <p className="text-xs text-muted-foreground">
            Répondez à 10 questions pour déterminer votre profil de risque
          </p>
        </div>
      </motion.div>

      <RiskQuiz onComplete={handleComplete} />
    </div>
  );
};

export default Quiz;
