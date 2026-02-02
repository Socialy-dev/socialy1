-- Add first_name and last_name columns
ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN last_name TEXT;

-- Drop the full_name column
ALTER TABLE public.profiles DROP COLUMN full_name;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;