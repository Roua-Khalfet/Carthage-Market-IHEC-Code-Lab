import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { computeMarketOverview, type SentimentAnalysis } from "@/hooks/useSentimentData";

type Props = {
  data: SentimentAnalysis[];
};

const COLORS = {
  positive: "hsl(160, 70%, 45%)",
  negative: "hsl(0, 75%, 55%)",
  neutral: "hsl(40, 90%, 55%)",
};

export const SentimentDistribution = ({ data }: Props) => {
  const overview = computeMarketOverview(data);

  const chartData = [
    { name: "Positif", value: overview.positive, color: COLORS.positive },
    { name: "Négatif", value: overview.negative, color: COLORS.negative },
    { name: "Neutre", value: overview.neutral, color: COLORS.neutral },
  ].filter((d) => d.value > 0);

  if (!chartData.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-lg p-6 flex items-center justify-center h-[300px]"
      >
        <p className="text-muted-foreground text-sm">Aucune donnée disponible</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-lg p-6"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Distribution du Sentiment
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 92%)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} articles`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
