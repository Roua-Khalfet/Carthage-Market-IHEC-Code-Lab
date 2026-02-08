import { useState, useMemo } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { usePortfolioHoldings, useAddHolding, useDeleteHolding } from "@/hooks/usePortfolio";
import { useMarketData } from "@/hooks/useMarketData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export const HoldingsManager = () => {
  const { data: holdings = [], isLoading } = usePortfolioHoldings();
  const { data: marketData = [] } = useMarketData();
  const addMutation = useAddHolding();
  const deleteMutation = useDeleteHolding();

  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");

  // Build price lookup from market data
  const priceMap = useMemo(() => new Map(marketData.map((s) => [s.symbol, s.price])), [marketData]);

  // Sorted stock list from market data (exclude indices-like entries)
  const stockOptions = useMemo(
    () => [...marketData].sort((a, b) => (a.symbol || "").localeCompare(b.symbol || "")),
    [marketData]
  );

  const handleAdd = () => {
    if (!symbol || !qty || Number(qty) <= 0) return;
    const purchasePrice = priceMap.get(symbol) || 0;
    addMutation.mutate({ symbol, quantity: Number(qty), purchase_price: purchasePrice });
    setSymbol("");
    setQty("");
  };

  const totalValue = holdings.reduce((sum, h) => {
    const currentPrice = priceMap.get(h.symbol) ?? h.purchase_price;
    return sum + currentPrice * h.quantity;
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + h.purchase_price * h.quantity, 0);
  const pnl = totalValue - totalCost;

  return (
    <div className="glass-card rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Mes Positions</h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Valeur totale</p>
          <p className="font-mono text-lg font-bold text-foreground">{fmt(totalValue)} TND</p>
          <p className={`font-mono text-xs font-medium ${pnl >= 0 ? "text-positive" : "text-negative"}`}>
            {pnl >= 0 ? "+" : ""}{fmt(pnl)} TND
          </p>
        </div>
      </div>

      {/* Add holding form */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder="Choisir une action" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {stockOptions.map((s) => (
                <SelectItem key={s.symbol} value={s.symbol} className="text-sm">
                  {s.symbol} — {s.name || s.symbol} ({s.price ? `${s.price} TND` : "—"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="1"
            placeholder="Qté"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-20 text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={addMutation.isPending || !symbol || !qty}>
            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
        {symbol && (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-secondary/40 text-xs">
            <span className="font-mono font-semibold text-primary">{symbol}</span>
            <span className="text-muted-foreground">
              Prix actuel : <span className="font-mono font-medium text-foreground">{fmt(priceMap.get(symbol) ?? 0)} TND</span>
            </span>
            {qty && Number(qty) > 0 && (
              <span className="text-muted-foreground ml-auto">
                Total : <span className="font-mono font-medium text-foreground">{fmt((priceMap.get(symbol) ?? 0) * Number(qty))} TND</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Holdings table */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : holdings.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Aucune position. Ajoutez vos actions ci-dessus.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Symbole</TableHead>
                <TableHead className="text-xs">Qté</TableHead>
                <TableHead className="text-xs">Prix Achat</TableHead>
                <TableHead className="text-xs">Prix Actuel</TableHead>
                <TableHead className="text-xs">Valeur</TableHead>
                <TableHead className="text-xs">P&L</TableHead>
                <TableHead className="text-xs w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((h) => {
                const currentPrice = priceMap.get(h.symbol) ?? h.purchase_price;
                const value = currentPrice * h.quantity;
                const cost = h.purchase_price * h.quantity;
                const holdingPnl = value - cost;
                return (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-sm font-semibold text-primary">
                      {h.symbol}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{h.quantity}</TableCell>
                    <TableCell className="font-mono text-sm">{fmt(h.purchase_price)}</TableCell>
                    <TableCell className="font-mono text-sm">{fmt(currentPrice)}</TableCell>
                    <TableCell className="font-mono text-sm">{fmt(value)}</TableCell>
                    <TableCell className={`font-mono text-sm font-medium ${holdingPnl >= 0 ? "text-positive" : "text-negative"}`}>
                      {holdingPnl >= 0 ? "+" : ""}{fmt(holdingPnl)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate(h.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
