import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useAnalyzeSentiment } from "@/hooks/useSentimentData";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const AnalyzeButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { analyze } = useAnalyzeSentiment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await analyze(20);
      toast({
        title: "Analyse terminée",
        description: `${result.analyzed || 0} articles analysés sur ${result.total_fetched || result.new_articles || 0} récupérés.`,
      });
      queryClient.invalidateQueries({ queryKey: ["sentiment-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["sentiment-by-stock"] });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Erreur d'analyse",
        description: error?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAnalyze}
      disabled={isLoading}
      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {isLoading ? "Analyse en cours..." : "Analyser les Articles"}
    </motion.button>
  );
};
