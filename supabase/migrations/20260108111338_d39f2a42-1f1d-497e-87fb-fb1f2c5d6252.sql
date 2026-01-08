-- Create dedicated table for competitor agencies
CREATE TABLE public.competitor_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  linkedin TEXT,
  email TEXT,
  specialty TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.competitor_agencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own agencies"
ON public.competitor_agencies
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agencies"
ON public.competitor_agencies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agencies"
ON public.competitor_agencies
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agencies"
ON public.competitor_agencies
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_competitor_agencies_updated_at
BEFORE UPDATE ON public.competitor_agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user queries
CREATE INDEX idx_competitor_agencies_user_id ON public.competitor_agencies(user_id);