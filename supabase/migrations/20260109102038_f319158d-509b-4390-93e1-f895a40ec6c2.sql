-- Create a table for admin resources (templates, press releases, etc.)
CREATE TABLE public.admin_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'communique', 'presentation', 'template', etc.
  description TEXT,
  file_url TEXT,
  content TEXT, -- For text-based resources
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.admin_resources ENABLE ROW LEVEL SECURITY;

-- Only admins can manage resources
CREATE POLICY "Admins can manage resources"
ON public.admin_resources
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can view resources (for using templates)
CREATE POLICY "Authenticated users can view resources"
ON public.admin_resources
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_resources_updated_at
BEFORE UPDATE ON public.admin_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', false);

-- Storage policies for resources bucket
CREATE POLICY "Admins can upload resources"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update resources"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete resources"
ON storage.objects
FOR DELETE
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view resources files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resources' AND auth.uid() IS NOT NULL);