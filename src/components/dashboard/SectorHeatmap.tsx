import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { getSectorLabel } from "@/lib/stocks";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { SentimentAnalysis } from "@/hooks/useSentimentData";

type Props = {
  data: SentimentAnalysis[];
};

const SECTORS_PER_PAGE = 6;

export const SectorHeatmap = ({ data }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const sectorScores = new Map<string, { total: number; count: number }>();
  for (const d of data) {
    for (const sector of d.affected_sectors || []) {
      const existing = sectorScores.get(sector) || { total: 0, count: 0 };
      existing.total += Number(d.sentiment_score);
      existing.count += 1;
      sectorScores.set(sector, existing);
    }
  }

  const allSectors = Array.from(sectorScores.entries())
    .map(([sector, { total, count }]) => ({
      sector,
      label: getSectorLabel(sector),
      score: total / count,
      count,
    }))
    .sort((a, b) => b.score - a.score);

  const totalPages = Math.ceil(allSectors.length / SECTORS_PER_PAGE);
  const startIndex = currentPage * SECTORS_PER_PAGE;
  const sectors = allSectors.slice(startIndex, startIndex + SECTORS_PER_PAGE);

  if (!allSectors.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-lg p-6 flex flex-col items-center justify-center h-[200px]"
      >
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">Aucune donnée sectorielle disponible</p>
      </motion.div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 0.2) return "from-positive to-positive/80";
    if (score > 0) return "from-positive/70 to-positive/50";
    if (score > -0.2) return "from-neutral-sentiment/70 to-neutral-sentiment/50";
    return "from-negative to-negative/80";
  };

  const getTextColor = (score: number) => {
    if (score > 0.1) return "text-positive";
    if (score < -0.1) return "text-negative";
    return "text-accent";
  };

  const getIcon = (score: number) => {
    if (score > 0.1) return TrendingUp;
    if (score < -0.1) return TrendingDown;
    return Minus;
  };

  const maxCount = Math.max(...sectors.map(s => s.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-lg p-6 border border-border/50 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg glow-primary">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Sentiment par Secteur
            </h3>
            <p className="text-xs text-muted-foreground">
              {allSectors.length} secteurs • Page {currentPage + 1}/{totalPages}
            </p>
          </div>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              {startIndex + 1}-{Math.min(startIndex + SECTORS_PER_PAGE, allSectors.length)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Grid of sector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sectors.map((s, i) => {
          const Icon = getIcon(s.score);
          const opacity = 0.3 + (s.count / maxCount) * 0.7;
          
          return (
            <motion.div
              key={s.sector}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(s.score)} rounded-lg blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              
              <div className="relative glass-card rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-all duration-300">
                {/* Header with icon */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${getTextColor(s.score)}`} />
                    <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                    {s.count} art.
                  </span>
                </div>

                {/* Score with visual bar */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold font-mono ${getTextColor(s.score)}`}>
                      {s.score > 0 ? "+" : ""}{s.score.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">score</span>
                  </div>
                  
                  {/* Visual progress bar */}
                  <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${opacity * 100}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                      className={`h-full bg-gradient-to-r ${getScoreColor(s.score)} rounded-full`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-positive" />
            <span>Positif (&gt; 0.1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Minus className="w-3 h-3 text-accent" />
            <span>Neutre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-negative" />
            <span>Négatif (&lt; -0.1)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
