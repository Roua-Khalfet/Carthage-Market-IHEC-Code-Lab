/**
 * Composant de sélection de société pour filtrer les anomalies
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface StockSelectorProps {
  selectedStock: string;
  onStockChange: (stock: string) => void;
  stocks: { ticker: string; company_name: string; count: number }[];
}

export function StockSelector({ selectedStock, onStockChange, stocks }: StockSelectorProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Filtrer par Société</h3>
      </div>
      
      <Select value={selectedStock} onValueChange={onStockChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Toutes les sociétés" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">
            <span className="font-medium">Toutes les sociétés</span>
            <span className="text-xs text-muted-foreground ml-2">
              ({stocks.reduce((sum, s) => sum + s.count, 0)} anomalies)
            </span>
          </SelectItem>
          {stocks
            .sort((a, b) => b.count - a.count)
            .map((stock) => (
              <SelectItem key={stock.ticker} value={stock.company_name}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{stock.company_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({stock.count})
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
