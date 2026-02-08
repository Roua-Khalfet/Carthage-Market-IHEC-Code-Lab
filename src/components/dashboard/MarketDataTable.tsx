import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  BarChart3,
  Activity,
} from "lucide-react";
import { useMarketData, useTriggerScrape, StockMarketRow } from "@/hooks/useMarketData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import technicalData from "@/data/technical-indicators.json";

type SortKey = keyof StockMarketRow;
type SortDir = "asc" | "desc";

const OVERVIEW_CACHE_KEY = "bvmt-market-overview-cache";

const formatNumber = (val: number | null, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return val.toFixed(decimals);
};

const ChangeCell = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  const isPositive = value > 0;
  const isNegative = value < 0;
  return (
    <span
      className={`font-mono text-sm font-medium ${
        isPositive ? "text-positive" : isNegative ? "text-negative" : "text-muted-foreground"
      }`}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

const RatingBadge = ({ rating }: { rating: string | null }) => {
  if (!rating) return <span className="text-muted-foreground">—</span>;
  const lower = rating.toLowerCase();
  let className = "";
  if (lower.includes("strong buy")) {
    className = "bg-positive/20 text-positive border-positive/30";
  } else if (lower.includes("buy")) {
    className = "bg-positive/10 text-positive border-positive/20";
  } else if (lower.includes("strong sell")) {
    className = "bg-negative/20 text-negative border-negative/30";
  } else if (lower.includes("sell")) {
    className = "bg-negative/10 text-negative border-negative/20";
  } else {
    className = "bg-neutral-sentiment/10 text-neutral-sentiment border-neutral-sentiment/20";
  }
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {rating}
    </Badge>
  );
};

const RSICell = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  let color = "text-muted-foreground";
  if (value >= 70) color = "text-negative";
  else if (value <= 30) color = "text-positive";
  else color = "text-neutral-sentiment";
  return <span className={`font-mono text-sm font-medium ${color}`}>{value.toFixed(2)}</span>;
};

const MACDCell = ({ level, signal }: { level: number; signal: number }) => {
  const diff = level - signal;
  const color = diff > 0 ? "text-positive" : diff < 0 ? "text-negative" : "text-muted-foreground";
  return (
    <div className="flex flex-col">
      <span className={`font-mono text-sm font-medium ${color}`}>{level.toFixed(2)}</span>
      <span className="font-mono text-[10px] text-muted-foreground">S: {signal.toFixed(2)}</span>
    </div>
  );
};

export const MarketDataTable = () => {
  const { data, isLoading } = useMarketData();
  const { isScraping, triggerScrape } = useTriggerScrape();
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeTab, setActiveTab] = useState("overview");

  // Cache overview data in localStorage
  useEffect(() => {
    if (data?.length) {
      try {
        localStorage.setItem(OVERVIEW_CACHE_KEY, JSON.stringify(data));
      } catch { /* ignore quota errors */ }
    }
  }, [data]);

  // Get cached data if live data is empty
  const overviewData = useMemo(() => {
    if (data?.length) return data;
    try {
      const cached = localStorage.getItem(OVERVIEW_CACHE_KEY);
      if (cached) return JSON.parse(cached) as StockMarketRow[];
    } catch { /* ignore */ }
    return [];
  }, [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!overviewData?.length) return [];
    return [...overviewData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [overviewData, sortKey, sortDir]);

  // Top 5 gainers and losers from overview data
  const { gainers, losers } = useMemo(() => {
    if (!overviewData?.length) return { gainers: [], losers: [] };
    const withChange = overviewData.filter((s) => s.change_percent !== null);
    const sorted = [...withChange].sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0));
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [overviewData]);

  const lastScrapedAt = overviewData?.[0]?.scraped_at
    ? new Date(overviewData[0].scraped_at).toLocaleString("fr-TN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const SortableHeader = ({
    column,
    label,
    className = "",
  }: {
    column: SortKey;
    label: string;
    className?: string;
  }) => (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === column && (
          <ArrowUpDown className="w-3 h-3 text-primary" />
        )}
      </div>
    </TableHead>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Top 5 Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gainers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-positive" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top 5 Hausse
            </h3>
          </div>
          <div className="space-y-2">
            {gainers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune donnée</p>
            ) : (
              gainers.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono w-4">{i + 1}</span>
                    <span className="font-mono text-sm font-semibold text-primary">{s.symbol}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{formatNumber(s.price)}</span>
                    <ChangeCell value={s.change_percent} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Losers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-negative" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top 5 Baisse
            </h3>
          </div>
          <div className="space-y-2">
            {losers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune donnée</p>
            ) : (
              losers.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono w-4">{i + 1}</span>
                    <span className="font-mono text-sm font-semibold text-primary">{s.symbol}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{formatNumber(s.price)}</span>
                    <ChangeCell value={s.change_percent} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Market Data Card */}
      <div className="glass-card rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Marché Tunisien
              </h2>
              {lastScrapedAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dernière mise à jour : {lastScrapedAt}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerScrape}
            disabled={isScraping}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScraping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isScraping ? "Scraping..." : "Rafraîchir"}
          </motion.button>
        </div>

        {/* Sub-Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 sm:px-5 pt-3">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="overview" className="text-xs">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="technicals" className="text-xs">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Indicateurs Techniques
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoading && !overviewData.length ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Overview Tab — Show only 5 rows */}
              <TabsContent value="overview" className="mt-0">
                {!sortedData.length ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Aucune donnée. Cliquez sur "Rafraîchir".
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <SortableHeader column="symbol" label="Symbole" />
                          <SortableHeader column="name" label="Nom" />
                          <SortableHeader column="price" label="Prix" />
                          <SortableHeader column="change_percent" label="Var %" />
                          <SortableHeader column="volume" label="Volume" />
                          <SortableHeader column="market_cap" label="Cap. Marché" />
                          <SortableHeader column="pe_ratio" label="P/E" />
                          <SortableHeader column="div_yield_ttm" label="Div %" />
                          <SortableHeader column="analyst_rating" label="Rating" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedData.map((stock) => (
                          <TableRow key={stock.id} className="group">
                            <TableCell className="font-mono font-semibold text-primary text-sm">
                              {stock.symbol}
                            </TableCell>
                            <TableCell className="text-sm max-w-[180px] truncate">
                              {stock.name || "—"}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {formatNumber(stock.price)}
                            </TableCell>
                            <TableCell>
                              <ChangeCell value={stock.change_percent} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {stock.volume || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {stock.market_cap || "—"}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {formatNumber(stock.pe_ratio)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {stock.div_yield_ttm !== null
                                ? `${formatNumber(stock.div_yield_ttm)}%`
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <RatingBadge rating={stock.analyst_rating} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Technicals Tab — From JSON data */}
              <TabsContent value="technicals" className="mt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Symbole</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>RSI (14)</TableHead>
                        <TableHead>MACD</TableHead>
                        <TableHead>Signal MACD</TableHead>
                        <TableHead>MACD vs Signal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technicalData.stocks.map((stock) => (
                        <TableRow key={stock.symbol} className="group">
                          <TableCell className="font-mono font-semibold text-primary text-sm">
                            {stock.symbol}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {stock.name}
                          </TableCell>
                          <TableCell>
                            <RSICell value={stock.rsi_14} />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {stock.macd_level.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {stock.macd_signal.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <MACDCell level={stock.macd_level} signal={stock.macd_signal} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </motion.div>
  );
};
