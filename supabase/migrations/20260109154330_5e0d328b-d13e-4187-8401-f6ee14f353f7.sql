CREATE POLICY "Admins can view all socialy articles" 
ON public.socialy_articles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all competitor articles" 
ON public.competitor_articles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all journalists" 
ON public.journalists 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all competitor agencies" 
ON public.competitor_agencies 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));