-- Add competitor_agencies column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN competitor_agencies text[] DEFAULT '{}'::text[];