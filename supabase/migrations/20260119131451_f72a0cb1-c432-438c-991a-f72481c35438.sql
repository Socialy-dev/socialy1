ALTER TABLE public.organization_resources 
ADD COLUMN organization_name TEXT;

UPDATE public.organization_resources 
SET organization_name = organizations.name
FROM public.organizations 
WHERE organization_resources.organization_id = organizations.id;

CREATE OR REPLACE FUNCTION public.sync_organization_name_to_resources()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.organization_resources
  SET organization_name = NEW.name
  WHERE organization_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_org_name_on_update
AFTER UPDATE OF name ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.sync_organization_name_to_resources();

CREATE OR REPLACE FUNCTION public.set_organization_name_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_name := (SELECT name FROM public.organizations WHERE id = NEW.organization_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_org_name_on_insert
BEFORE INSERT ON public.organization_resources
FOR EACH ROW
EXECUTE FUNCTION public.set_organization_name_on_insert();