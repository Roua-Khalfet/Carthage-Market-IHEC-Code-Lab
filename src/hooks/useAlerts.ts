import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  anomalyId: string;
  timestamp: string;
  stock: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  action: "resolved" | "pending" | "dismissed";
  actionDetails?: string;
  actionTimestamp?: string;
}

/**
 * Hook pour récupérer l'historique des alertes
 */
export function useAlerts() {
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      // TODO: Remplacer par un vrai appel API
      // const { data, error } = await supabase
      //   .from("alerts")
      //   .select("*")
      //   .order("timestamp", { ascending: false })
      //   .limit(100);
      
      // if (error) throw error;
      // return data as Alert[];

      // Données mockées
      return generateMockAlerts();
    },
  });

  return {
    alerts: alerts || [],
    isLoading,
    error,
  };
}

/**
 * Hook pour marquer une alerte comme résolue
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, details }: { alertId: string; details?: string }) => {
      // TODO: Remplacer par un vrai appel API
      // const { error } = await supabase
      //   .from("alerts")
      //   .update({
      //     action: "resolved",
      //     actionDetails: details,
      //     actionTimestamp: new Date().toISOString(),
      //   })
      //   .eq("id", alertId);
      
      // if (error) throw error;
      
      return { alertId, details };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de résoudre l'alerte.",
        variant: "destructive",
      });
      console.error("Error resolving alert:", error);
    },
  });
}

/**
 * Hook pour ignorer une alerte
 */
export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, reason }: { alertId: string; reason?: string }) => {
      // TODO: Remplacer par un vrai appel API
      // const { error } = await supabase
      //   .from("alerts")
      //   .update({
      //     action: "dismissed",
      //     actionDetails: reason,
      //     actionTimestamp: new Date().toISOString(),
      //   })
      //   .eq("id", alertId);
      
      // if (error) throw error;
      
      return { alertId, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alerte ignorée",
        description: "L'alerte a été marquée comme ignorée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ignorer l'alerte.",
        variant: "destructive",
      });
      console.error("Error dismissing alert:", error);
    },
  });
}

/**
 * Hook pour créer une nouvelle alerte
 */
export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<Alert, "id" | "timestamp" | "action">) => {
      // TODO: Remplacer par un vrai appel API
      // const { data, error } = await supabase
      //   .from("alerts")
      //   .insert({
      //     ...alert,
      //     timestamp: new Date().toISOString(),
      //     action: "pending",
      //   })
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return data as Alert;
      
      return {
        ...alert,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        action: "pending" as const,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alerte créée",
        description: "Une nouvelle alerte a été créée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte.",
        variant: "destructive",
      });
      console.error("Error creating alert:", error);
    },
  });
}

// Fonctions utilitaires

function generateMockAlerts(): Alert[] {
  const stocks = ["BIAT", "BNA", "ATB", "UIB", "SFBT", "STB"];
  const types = ["volume", "price", "news"];
  const severities: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  const actions: Array<"resolved" | "pending" | "dismissed"> = ["resolved", "pending", "dismissed"];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `alert-${i}`,
    anomalyId: `anomaly-${i}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    stock: stocks[Math.floor(Math.random() * stocks.length)],
    type: types[Math.floor(Math.random() * types.length)],
    description: generateAlertDescription(),
    severity: severities[Math.floor(Math.random() * severities.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    actionDetails: Math.random() > 0.5 ? generateActionDetails() : undefined,
    actionTimestamp: Math.random() > 0.3 ? new Date(Date.now() - i * 1800000).toISOString() : undefined,
  }));
}

function generateAlertDescription(): string {
  const descriptions = [
    "Pic de volume exceptionnel détecté",
    "Variation de prix anormale sans catalyseur",
    "Volume inhabituellement bas",
    "Pattern suspect dans le carnet d'ordres",
    "Divergence significative avec le secteur",
    "Spike de volatilité détecté",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateActionDetails(): string {
  const details = [
    "Transaction confirmée par l'émetteur",
    "Fluctuation liée à l'annonce de résultats",
    "Mouvement justifié par le contexte du marché",
    "En attente de clarifications",
    "Anomalie confirmée, enquête en cours",
  ];
  return details[Math.floor(Math.random() * details.length)];
}
