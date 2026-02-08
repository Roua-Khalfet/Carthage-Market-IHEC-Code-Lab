import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SentimentAnalysis } from "@/hooks/useSentimentData";

type Props = {
  articles: SentimentAnalysis[];
  title?: string;
};

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment) {
    case "positive":
      return <TrendingUp className="w-4 h-4 text-positive" />;
    case "negative":
      return <TrendingDown className="w-4 h-4 text-negative" />;
    default:
      return <Minus className="w-4 h-4 text-neutral-sentiment" />;
  }
};

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const config = {
    positive: { label: "Positif", classes: "bg-positive/10 text-positive" },
    negative: { label: "Négatif", classes: "bg-negative/10 text-negative" },
    neutral: { label: "Neutre", classes: "bg-neutral-sentiment/10 text-neutral-sentiment" },
  };
  const c = config[sentiment as keyof typeof config] || config.neutral;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${c.classes}`}>
      {c.label}
    </span>
  );
};

export const RecentArticles = ({ articles, title = "Articles Récents" }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card rounded-lg"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {articles.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">Aucun article analysé</p>
        ) : (
          articles.slice(0, 10).map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <SentimentIcon sentiment={article.sentiment} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SentimentBadge sentiment={article.sentiment} />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {article.published_date}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground leading-snug mb-1 line-clamp-2">
                    {article.article_title}
                  </h4>
                  {article.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      Score:{" "}
                      <span
                        className={
                          Number(article.sentiment_score) > 0
                            ? "text-positive"
                            : Number(article.sentiment_score) < 0
                            ? "text-negative"
                            : "text-neutral-sentiment"
                        }
                      >
                        {Number(article.sentiment_score) > 0 ? "+" : ""}
                        {Number(article.sentiment_score).toFixed(2)}
                      </span>
                    </span>
                    {article.article_url && (
                      <a
                        href={article.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
