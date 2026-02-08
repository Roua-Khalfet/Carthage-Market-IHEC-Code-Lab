
-- Add initial_capital column to investor_profiles
ALTER TABLE public.investor_profiles ADD COLUMN initial_capital numeric NOT NULL DEFAULT 0;

-- Create user portfolio holdings table
CREATE TABLE public.user_portfolio_holdings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  purchase_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable RLS
ALTER TABLE public.user_portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own holdings"
ON public.user_portfolio_holdings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings"
ON public.user_portfolio_holdings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
ON public.user_portfolio_holdings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings"
ON public.user_portfolio_holdings FOR DELETE
USING (auth.uid() = user_id);
