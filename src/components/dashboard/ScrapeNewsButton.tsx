import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGoogleNewsScraper, ScrapeProgress } from "@/hooks/useGoogleNewsScraper";
import { Progress } from "@/components/ui/progress";

export const ScrapeNewsButton = () => {
  const { isRunning, progress, runScrapeAndAnalyze } = useGoogleNewsScraper();
  const [showDetails, setShowDetails] = useState(false);

  const progressPercent =
    progress.phase === "scraping"
      ? Math.round((progress.currentSectorIndex / progress.totalSectors) * 80)
      : progress.phase === "analyzing"
      ? 90
      : progress.phase === "done"
      ? 100
      : 0;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runScrapeAndAnalyze}
        disabled={isRunning}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        {isRunning ? "Scraping en cours..." : "Scraper Google Actualités"}
      </motion.button>

      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {progress.phase === "scraping"
                    ? "Scraping Google Actualités"
                    : progress.phase === "analyzing"
                    ? "Analyse des sentiments"
                    : "Terminé"}
                </span>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <Progress value={progressPercent} className="h-1.5" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {progress.phase === "scraping"
                    ? `Secteur ${progress.currentSectorIndex}/${progress.totalSectors}`
                    : progress.currentSector}
                </span>
                <span>{progressPercent}%</span>
              </div>

              {progress.phase === "scraping" && progress.currentSector && (
                <p className="text-xs text-primary truncate">{progress.currentSector}</p>
              )}

              <div className="flex gap-4 text-xs">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{progress.articlesScraped}</span> scrapés
                </span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{progress.articlesInserted}</span> insérés
                </span>
              </div>

              <AnimatePresence>
                {showDetails && progress.errors.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-32 overflow-y-auto space-y-1 border-t border-border pt-2 mt-1">
                      {progress.errors.map((err, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-destructive">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="break-all">{err}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {progress.phase === "done" && !isRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-3 z-50"
          >
            <div className="flex items-center gap-2 text-xs text-primary">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {progress.articlesScraped} articles scrapés, {progress.articlesInserted} insérés
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
