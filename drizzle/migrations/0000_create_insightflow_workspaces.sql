CREATE TABLE public.insightflow_workspaces (user_id uuid PRIMARY KEY, payload jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insightflow_workspaces TO authenticated;
GRANT ALL ON public.insightflow_workspaces TO service_role;
ALTER TABLE public.insightflow_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their workspace" ON public.insightflow_workspaces FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners create their workspace" ON public.insightflow_workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update their workspace" ON public.insightflow_workspaces FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners delete their workspace" ON public.insightflow_workspaces FOR DELETE TO authenticated USING (auth.uid() = user_id);