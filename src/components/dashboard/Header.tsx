import { motion } from "framer-motion";
import { BarChart3, LogOut, Shield, Target, Flame, User, AlertTriangle } from "lucide-react";
import { AnalyzeButton } from "./AnalyzeButton";
import { ScrapeNewsButton } from "./ScrapeNewsButton";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const profileIcons = {
  conservateur: Shield,
  modere: Target,
  agressif: Flame,
};

const profileLabels = {
  conservateur: "Conservateur",
  modere: "Modéré",
  agressif: "Agressif",
};

export const Header = () => {
  const { user, role, riskProfile, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl glow-primary">
          <BarChart3 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Carthage Market Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analyse de Sentiment du Marché Tunisien
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {/* User info badges */}
        {role && (
          <Badge variant="outline" className="text-xs gap-1">
            <User className="w-3 h-3" />
            {role === "investisseur" ? "Investisseur" : "Régulateur CMF"}
            <span className="ml-1 opacity-50">({role})</span>
          </Badge>
        )}
        {riskProfile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs gap-1">
                {profileIcons[riskProfile] && (() => {
                  const Icon = profileIcons[riskProfile];
                  return <Icon className="w-3 h-3" />;
                })()}
                {profileLabels[riskProfile]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Profil de risque investisseur</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Alerts button - only for CMF regulators */}
        {role === "regulateur" && (
          <Link to="/alerts">
            <Button variant="outline" size="sm" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Surveillance & Alertes</span>
              <span className="sm:hidden">Alertes</span>
            </Button>
          </Link>
        )}

        <ScrapeNewsButton />
        <AnalyzeButton />

        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Se déconnecter</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </motion.header>
  );
};
