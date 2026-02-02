
CREATE TABLE public.communique_presse (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    pdf_url TEXT,
    word_url TEXT,
    assets_link TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.communique_presse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage communiques" 
ON public.communique_presse 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view communiques" 
ON public.communique_presse 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_communique_presse_updated_at
BEFORE UPDATE ON public.communique_presse
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) 
VALUES ('communique_presse', 'communique_presse', false);

CREATE POLICY "Admins can upload communique files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'communique_presse' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update communique files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'communique_presse' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete communique files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'communique_presse' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view communique files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'communique_presse' AND auth.uid() IS NOT NULL);
