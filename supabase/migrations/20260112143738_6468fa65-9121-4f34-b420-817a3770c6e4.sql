-- Renommer la table socialy_articles en organization_articles
ALTER TABLE public.socialy_articles RENAME TO organization_articles;

-- Renommer les policies RLS pour refléter le nouveau nom
ALTER POLICY "Admins can manage all socialy articles" ON public.organization_articles RENAME TO "Admins can manage all organization articles";
ALTER POLICY "Admins can view all socialy articles" ON public.organization_articles RENAME TO "Admins can view all organization articles";
ALTER POLICY "Super admins can manage all socialy articles" ON public.organization_articles RENAME TO "Super admins can manage all organization articles";
ALTER POLICY "Super admins can view all socialy articles" ON public.organization_articles RENAME TO "Super admins can view all organization articles";
ALTER POLICY "Users can delete their own socialy articles" ON public.organization_articles RENAME TO "Users can delete their own organization articles";
ALTER POLICY "Users can insert their own socialy articles" ON public.organization_articles RENAME TO "Users can insert their own organization articles";
ALTER POLICY "Users can update their own socialy articles" ON public.organization_articles RENAME TO "Users can update their own organization articles";
ALTER POLICY "Users can view their own socialy articles" ON public.organization_articles RENAME TO "Users can view their own organization articles";