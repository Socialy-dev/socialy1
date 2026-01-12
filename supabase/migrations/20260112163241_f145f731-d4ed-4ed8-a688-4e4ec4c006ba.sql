
DROP TRIGGER IF EXISTS extract_journalist_from_competitor_article_trigger ON public.competitor_articles;

CREATE TRIGGER extract_journalist_from_competitor_article_trigger
  AFTER INSERT OR UPDATE ON public.competitor_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.extract_journalist_from_competitor_article();
