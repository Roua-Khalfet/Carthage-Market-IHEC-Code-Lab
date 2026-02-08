import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

type TimelinePoint = {
  date: string;
  score: number;
  count: number;
};

type Props = {
  data: TimelinePoint[];
  title?: string;
};

export const SentimentTimeline = ({ data, title = "Évolution du Sentiment" }: Props) => {
  if (!data.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-lg p-6 flex items-center justify-center h-[300px]"
      >
        <p className="text-muted-foreground text-sm">Aucune donnée temporelle</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-lg p-6"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(220, 15%, 18%)" }}
              tickFormatter={(val) => {
                // Handle both dd/mm/yyyy and yyyy-mm-dd formats
                const parts = val.includes("/") ? val.split("/") : val.split("-");
                if (val.includes("/") && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
                if (val.includes("-") && parts.length >= 2) return `${parts[1]}/${parts[0].slice(2)}`;
                return val.slice(5);
              }}
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(220, 15%, 18%)" }}
              tickFormatter={(val) => val.toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 92%)",
                fontSize: "12px",
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: number) => [value.toFixed(2), "Score"]}
            />
            <ReferenceLine y={0} stroke="hsl(220, 15%, 25%)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(210, 60%, 55%)"
              strokeWidth={2}
              dot={{ fill: "hsl(210, 60%, 55%)", r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "hsl(210, 60%, 55%)",
                stroke: "hsl(220, 18%, 10%)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
