import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type PortfolioHolding = {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  purchase_price: number;
  created_at: string;
};

export const usePortfolioHoldings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["portfolio-holdings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_portfolio_holdings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PortfolioHolding[];
    },
    enabled: !!user,
  });
};

export const useAddHolding = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      symbol,
      quantity,
      purchase_price,
    }: {
      symbol: string;
      quantity: number;
      purchase_price: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_portfolio_holdings")
        .upsert(
          { user_id: user.id, symbol, quantity, purchase_price },
          { onConflict: "user_id,symbol" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-holdings"] });
      toast({ title: "Position ajoutée", description: "Votre holding a été sauvegardé." });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
};

export const useDeleteHolding = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_portfolio_holdings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-holdings"] });
      toast({ title: "Position supprimée" });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
};

export const useInitialCapital = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["initial-capital", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("initial_capital")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data?.initial_capital as number) || 0;
    },
    enabled: !!user,
  });
};

export const useUpdateCapital = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (capital: number) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("investor_profiles")
        .update({ initial_capital: capital })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initial-capital"] });
      toast({ title: "Capital mis à jour" });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
};
