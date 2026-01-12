
DROP POLICY IF EXISTS "Users can view their own organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Users can insert their own organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Users can update their own organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Users can delete their own organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Admins can manage all organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Admins can view all organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Super admins can manage all organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Super admins can view all organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Org members can view organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Org admins can insert organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Org admins can update organization articles" ON organization_articles;
DROP POLICY IF EXISTS "Org admins can delete organization articles" ON organization_articles;

DROP POLICY IF EXISTS "Users can view their own articles" ON competitor_articles;
DROP POLICY IF EXISTS "Users can insert their own articles" ON competitor_articles;
DROP POLICY IF EXISTS "Users can update their own articles" ON competitor_articles;
DROP POLICY IF EXISTS "Users can delete their own articles" ON competitor_articles;
DROP POLICY IF EXISTS "Admins can manage all competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Admins can view all competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Super admins can manage all competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Super admins can view all competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Org members can view competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Org admins can insert competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Org admins can update competitor articles" ON competitor_articles;
DROP POLICY IF EXISTS "Org admins can delete competitor articles" ON competitor_articles;

DROP POLICY IF EXISTS "Users can view their own agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Users can insert their own agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Users can update their own agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Users can delete their own agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Admins can manage all competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Admins can view all competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Super admins can manage all competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Super admins can view all competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Org members can view competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Org admins can insert competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Org admins can update competitor agencies" ON competitor_agencies;
DROP POLICY IF EXISTS "Org admins can delete competitor agencies" ON competitor_agencies;

DROP POLICY IF EXISTS "Users can view their own journalists" ON journalists;
DROP POLICY IF EXISTS "Users can insert their own journalists" ON journalists;
DROP POLICY IF EXISTS "Users can update their own journalists" ON journalists;
DROP POLICY IF EXISTS "Users can delete their own journalists" ON journalists;
DROP POLICY IF EXISTS "Admins can manage journalists" ON journalists;
DROP POLICY IF EXISTS "Super admins can manage all journalists" ON journalists;
DROP POLICY IF EXISTS "Super admins can view all journalists" ON journalists;
DROP POLICY IF EXISTS "Org members can view journalists" ON journalists;
DROP POLICY IF EXISTS "Org admins can insert journalists" ON journalists;
DROP POLICY IF EXISTS "Org admins can update journalists" ON journalists;
DROP POLICY IF EXISTS "Org admins can delete journalists" ON journalists;

ALTER TABLE organization_articles DROP COLUMN IF EXISTS user_id;
ALTER TABLE competitor_articles DROP COLUMN IF EXISTS user_id;
ALTER TABLE competitor_agencies DROP COLUMN IF EXISTS user_id;
ALTER TABLE journalists DROP COLUMN IF EXISTS user_id;

CREATE POLICY "Org members can view organization articles" 
ON organization_articles FOR SELECT 
USING (
  is_super_admin(auth.uid()) OR 
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Org admins can insert organization articles" 
ON organization_articles FOR INSERT 
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = organization_articles.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can update organization articles" 
ON organization_articles FOR UPDATE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = organization_articles.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can delete organization articles" 
ON organization_articles FOR DELETE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = organization_articles.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org members can view competitor articles" 
ON competitor_articles FOR SELECT 
USING (
  is_super_admin(auth.uid()) OR 
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Org admins can insert competitor articles" 
ON competitor_articles FOR INSERT 
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = competitor_articles.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can update competitor articles" 
ON competitor_articles FOR UPDATE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = competitor_articles.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can delete competitor articles" 
ON competitor_articles FOR DELETE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = competitor_articles.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org members can view competitor agencies" 
ON competitor_agencies FOR SELECT 
USING (
  is_super_admin(auth.uid()) OR 
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Org admins can insert competitor agencies" 
ON competitor_agencies FOR INSERT 
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = competitor_agencies.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can update competitor agencies" 
ON competitor_agencies FOR UPDATE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = competitor_agencies.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can delete competitor agencies" 
ON competitor_agencies FOR DELETE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = competitor_agencies.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org members can view journalists" 
ON journalists FOR SELECT 
USING (
  is_super_admin(auth.uid()) OR 
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY "Org admins can insert journalists" 
ON journalists FOR INSERT 
WITH CHECK (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = journalists.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can update journalists" 
ON journalists FOR UPDATE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = journalists.organization_id AND role IN ('super_admin', 'org_admin'))
);

CREATE POLICY "Org admins can delete journalists" 
ON journalists FOR DELETE 
USING (
  is_super_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND organization_id = journalists.organization_id AND role IN ('super_admin', 'org_admin'))
);
