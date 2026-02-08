import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, Bell, Filter } from "lucide-react";

interface AnomalyFiltersProps {
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
  counts: {
    volume: number;
    price: number;
    news: number;
  };
}

const filterConfig = [
  {
    type: "volume",
    label: "Volume",
    icon: Activity,
    color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  },
  {
    type: "price",
    label: "Prix",
    icon: TrendingUp,
    color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  },
  {
    type: "news",
    label: "News",
    icon: Bell,
    color: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  },
];

export function AnomalyFilters({ activeFilters, onToggleFilter, counts }: AnomalyFiltersProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Filtres</h3>
      </div>

      <div className="space-y-2">
        {filterConfig.map(({ type, label, icon: Icon, color }) => {
          const isActive = activeFilters.includes(type);
          const count = counts[type as keyof typeof counts];

          return (
            <Button
              key={type}
              variant={isActive ? "default" : "outline"}
              className={`w-full justify-between ${!isActive && color}`}
              onClick={() => onToggleFilter(type)}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
              <Badge variant={isActive ? "secondary" : "outline"}>
                {count}
              </Badge>
            </Button>
          );
        })}

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => activeFilters.forEach(onToggleFilter)}
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>
    </Card>
  );
}
