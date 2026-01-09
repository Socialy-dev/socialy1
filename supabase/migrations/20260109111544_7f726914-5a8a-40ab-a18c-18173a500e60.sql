
CREATE TABLE public.generated_posts_linkedin (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    objective TEXT,
    tone TEXT,
    generated_content TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.generated_posts_linkedin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated posts"
ON public.generated_posts_linkedin
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated posts"
ON public.generated_posts_linkedin
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated posts"
ON public.generated_posts_linkedin
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated posts"
ON public.generated_posts_linkedin
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_generated_posts_linkedin_updated_at
BEFORE UPDATE ON public.generated_posts_linkedin
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
