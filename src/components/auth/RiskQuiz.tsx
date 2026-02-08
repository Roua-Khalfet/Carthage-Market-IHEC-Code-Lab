import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Shield, Target, Flame, Circle, CheckCircle2 } from "lucide-react";
import type { RiskProfile } from "@/hooks/useAuth";

const QUESTIONS = [
  {
    question: "Quel est votre objectif principal d'investissement ?",
    options: [
      { label: "Préserver mon capital à tout prix", score: 1 },
      { label: "Croissance modérée avec un risque limité", score: 2 },
      { label: "Maximiser les rendements, même avec des risques élevés", score: 3 },
    ],
  },
  {
    question: "Quel est votre horizon d'investissement ?",
    options: [
      { label: "Moins de 2 ans", score: 1 },
      { label: "Entre 2 et 5 ans", score: 2 },
      { label: "Plus de 5 ans", score: 3 },
    ],
  },
  {
    question: "Comment réagiriez-vous si votre portefeuille perdait 20% en un mois ?",
    options: [
      { label: "Je vendrais tout immédiatement", score: 1 },
      { label: "J'attendrais en espérant une reprise", score: 2 },
      { label: "J'achèterais davantage pour profiter des prix bas", score: 3 },
    ],
  },
  {
    question: "Quelle part de votre épargne êtes-vous prêt à investir en bourse ?",
    options: [
      { label: "Moins de 10%", score: 1 },
      { label: "Entre 10% et 40%", score: 2 },
      { label: "Plus de 40%", score: 3 },
    ],
  },
  {
    question: "Avez-vous une expérience préalable en investissement boursier ?",
    options: [
      { label: "Aucune expérience", score: 1 },
      { label: "Quelques années d'expérience", score: 2 },
      { label: "Expérience significative (5+ ans)", score: 3 },
    ],
  },
  {
    question: "Quel type de rendement annuel espérez-vous ?",
    options: [
      { label: "3-5% (supérieur à l'épargne bancaire)", score: 1 },
      { label: "5-15% (rendement marché)", score: 2 },
      { label: "15%+ (rendement agressif)", score: 3 },
    ],
  },
  {
    question: "Comment décrivez-vous votre situation financière actuelle ?",
    options: [
      { label: "Revenus limités avec des charges importantes", score: 1 },
      { label: "Revenus stables avec une épargne de précaution", score: 2 },
      { label: "Revenus confortables avec un patrimoine diversifié", score: 3 },
    ],
  },
  {
    question: "Quelle volatilité acceptez-vous sur vos investissements ?",
    options: [
      { label: "Très faible – je préfère la stabilité", score: 1 },
      { label: "Modérée – des fluctuations acceptables", score: 2 },
      { label: "Élevée – les fluctuations ne me dérangent pas", score: 3 },
    ],
  },
  {
    question: "En cas de crise économique majeure, que feriez-vous ?",
    options: [
      { label: "Retirer mes investissements pour sécuriser mon capital", score: 1 },
      { label: "Ne rien faire et attendre la reprise", score: 2 },
      { label: "Investir massivement sur les opportunités", score: 3 },
    ],
  },
  {
    question: "Quel secteur préférez-vous pour investir sur la BVMT ?",
    options: [
      { label: "Secteurs défensifs (banques, assurances)", score: 1 },
      { label: "Secteurs diversifiés (industrie, agroalimentaire)", score: 2 },
      { label: "Secteurs à forte croissance (tech, immobilier)", score: 3 },
    ],
  },
];

interface RiskQuizProps {
  onComplete: (profile: RiskProfile, answers: number[], score: number) => void;
}

export const RiskQuiz = ({ onComplete }: RiskQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(10).fill(-1));
  const [showResult, setShowResult] = useState(false);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);
  };

  const goNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const totalScore = answers.reduce((sum, a) => sum + (a > 0 ? a : 0), 0);

  const getProfile = (): RiskProfile => {
    if (totalScore <= 14) return "conservateur";
    if (totalScore <= 23) return "modere";
    return "agressif";
  };

  const profileInfo: Record<RiskProfile, { label: string; description: string; icon: typeof Shield; color: string }> = {
    conservateur: {
      label: "Conservateur",
      description: "Vous privilégiez la sécurité et la préservation du capital. Les placements à faible risque et à rendement stable vous conviennent le mieux.",
      icon: Shield,
      color: "text-blue-400",
    },
    modere: {
      label: "Modéré",
      description: "Vous recherchez un équilibre entre croissance et sécurité. Un portefeuille diversifié avec un mix d'actifs vous correspond.",
      icon: Target,
      color: "text-amber-400",
    },
    agressif: {
      label: "Agressif",
      description: "Vous visez des rendements élevés et acceptez une volatilité importante. Les opportunités de forte croissance vous attirent.",
      icon: Flame,
      color: "text-red-400",
    },
  };

  if (showResult) {
    const profile = getProfile();
    const info = profileInfo[profile];
    const Icon = info.icon;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="glass-card border-border/50">
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto p-4 rounded-full bg-card mb-4 ${info.color}`}>
              <Icon className="w-10 h-10" />
            </div>
            <CardTitle className="text-xl">Votre Profil Investisseur</CardTitle>
            <CardDescription className="text-base mt-2">
              Score : {totalScore}/30
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`text-center text-2xl font-bold ${info.color}`}>
              {info.label}
            </div>
            <p className="text-muted-foreground text-sm text-center leading-relaxed">
              {info.description}
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => onComplete(profile, answers, totalScore)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer et accéder au dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const q = QUESTIONS[currentQuestion];

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1}/{QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="text-base mt-4 leading-relaxed">
            {q.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-3">
                {q.options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswer(option.score)}
                    className={`flex items-center gap-3 w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      answers[currentQuestion] === option.score
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground"
                    }`}
                  >
                    {answers[currentQuestion] === option.score ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 shrink-0" />
                    )}
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <Button
              size="sm"
              onClick={goNext}
              disabled={answers[currentQuestion] === -1}
            >
              {currentQuestion === QUESTIONS.length - 1 ? "Voir le résultat" : "Suivant"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
