
-- Drop existing restrictive policies and recreate as permissive for competitor_agencies
DROP POLICY IF EXISTS "Admins can view all competitor agencies" ON public.competitor_agencies;
DROP POLICY IF EXISTS "Users can view their own agencies" ON public.competitor_agencies;
DROP POLICY IF EXISTS "Users can delete their own agencies" ON public.competitor_agencies;
DROP POLICY IF EXISTS "Users can insert their own agencies" ON public.competitor_agencies;
DROP POLICY IF EXISTS "Users can update their own agencies" ON public.competitor_agencies;

CREATE POLICY "Admins can view all competitor agencies" ON public.competitor_agencies FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own agencies" ON public.competitor_agencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own agencies" ON public.competitor_agencies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own agencies" ON public.competitor_agencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own agencies" ON public.competitor_agencies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all competitor agencies" ON public.competitor_agencies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing restrictive policies and recreate as permissive for competitor_articles
DROP POLICY IF EXISTS "Admins can view all competitor articles" ON public.competitor_articles;
DROP POLICY IF EXISTS "Users can view their own articles" ON public.competitor_articles;
DROP POLICY IF EXISTS "Users can delete their own articles" ON public.competitor_articles;
DROP POLICY IF EXISTS "Users can insert their own articles" ON public.competitor_articles;
DROP POLICY IF EXISTS "Users can update their own articles" ON public.competitor_articles;

CREATE POLICY "Admins can view all competitor articles" ON public.competitor_articles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own articles" ON public.competitor_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own articles" ON public.competitor_articles FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own articles" ON public.competitor_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own articles" ON public.competitor_articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all competitor articles" ON public.competitor_articles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing restrictive policies and recreate as permissive for journalists
DROP POLICY IF EXISTS "Admins can view all journalists" ON public.journalists;
DROP POLICY IF EXISTS "Users can view their own journalists" ON public.journalists;
DROP POLICY IF EXISTS "Users can delete their own journalists" ON public.journalists;
DROP POLICY IF EXISTS "Users can insert their own journalists" ON public.journalists;
DROP POLICY IF EXISTS "Users can update their own journalists" ON public.journalists;

CREATE POLICY "Admins can view all journalists" ON public.journalists FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own journalists" ON public.journalists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journalists" ON public.journalists FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journalists" ON public.journalists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journalists" ON public.journalists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all journalists" ON public.journalists FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing restrictive policies and recreate as permissive for socialy_articles
DROP POLICY IF EXISTS "Admins can view all socialy articles" ON public.socialy_articles;
DROP POLICY IF EXISTS "Users can view their own socialy articles" ON public.socialy_articles;
DROP POLICY IF EXISTS "Users can delete their own socialy articles" ON public.socialy_articles;
DROP POLICY IF EXISTS "Users can insert their own socialy articles" ON public.socialy_articles;
DROP POLICY IF EXISTS "Users can update their own socialy articles" ON public.socialy_articles;

CREATE POLICY "Admins can view all socialy articles" ON public.socialy_articles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own socialy articles" ON public.socialy_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own socialy articles" ON public.socialy_articles FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own socialy articles" ON public.socialy_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own socialy articles" ON public.socialy_articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all socialy articles" ON public.socialy_articles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
