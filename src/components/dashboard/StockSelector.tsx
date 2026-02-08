import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { getAllStocks, getSectorLabel } from "@/lib/stocks";

type Props = {
  selectedStock: string;
  onSelectStock: (stock: string) => void;
};

export const StockSelector = ({ selectedStock, onSelectStock }: Props) => {
  const [search, setSearch] = useState("");
  const allStocks = useMemo(() => getAllStocks(), []);

  const filtered = useMemo(() => {
    if (!search) return allStocks;
    const lower = search.toLowerCase();
    return allStocks.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.sector.toLowerCase().includes(lower) ||
        getSectorLabel(s.sector).toLowerCase().includes(lower)
    );
  }, [search, allStocks]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const stock of filtered) {
      const arr = map.get(stock.sector) || [];
      arr.push(stock);
      map.set(stock.sector, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Sélectionner une Valeur
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {Array.from(grouped.entries()).map(([sector, stocks]) => (
          <div key={sector}>
            <div className="px-4 py-2 bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground sticky top-0">
              {getSectorLabel(sector)}
            </div>
            {stocks.map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => onSelectStock(stock.name)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-border/50 hover:bg-secondary ${
                  selectedStock === stock.name
                    ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                    : "text-foreground"
                }`}
              >
                {stock.name}
              </button>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground text-center">Aucun résultat</p>
        )}
      </div>
    </div>
  );
};
