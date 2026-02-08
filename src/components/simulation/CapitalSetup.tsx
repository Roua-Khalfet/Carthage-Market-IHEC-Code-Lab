import { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { useInitialCapital, useUpdateCapital } from "@/hooks/usePortfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export const CapitalSetup = () => {
  const { data: capital = 0, isLoading } = useInitialCapital();
  const updateMutation = useUpdateCapital();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSave = () => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    updateMutation.mutate(num, {
      onSuccess: () => setEditing(false),
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-5 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Capital Initial</h3>
      </div>

      {capital === 0 && !editing ? (
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Définissez votre capital de départ pour commencer la simulation
          </p>
          <Button size="sm" onClick={() => setEditing(true)}>
            Définir mon capital
          </Button>
        </div>
      ) : editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            step="100"
            placeholder="Ex: 10000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 text-sm"
            autoFocus
          />
          <span className="text-xs text-muted-foreground">TND</span>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-2xl font-bold text-foreground">{fmt(capital)} TND</p>
            <p className="text-[10px] text-muted-foreground">Argent de poche pour investir</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setValue(String(capital));
              setEditing(true);
            }}
          >
            Modifier
          </Button>
        </div>
      )}
    </div>
  );
};
