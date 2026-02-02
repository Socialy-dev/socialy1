import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

const urlCache: SignedUrlCache = {};
const CACHE_BUFFER = 5 * 60 * 1000;

export function useSignedUrl(path: string | null, bucket: string = "communique_presse") {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getUrl = useCallback(async () => {
    if (!path) {
      setSignedUrl(null);
      return;
    }

    const cacheKey = `${bucket}/${path}`;
    const cached = urlCache[cacheKey];
    
    if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER) {
      setSignedUrl(cached.url);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600);

      if (signError) throw signError;
      
      if (data?.signedUrl) {
        urlCache[cacheKey] = {
          url: data.signedUrl,
          expiresAt: Date.now() + 3600 * 1000,
        };
        setSignedUrl(data.signedUrl);
      }
    } catch (err) {
      console.error("Error creating signed URL:", err);
      setError(err instanceof Error ? err : new Error("Failed to create signed URL"));
      setSignedUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [path, bucket]);

  useEffect(() => {
    getUrl();
  }, [getUrl]);

  return { signedUrl, isLoading, error, refresh: getUrl };
}

export async function getSignedUrlAsync(path: string | null, bucket: string = "communique_presse"): Promise<string | null> {
  if (!path) return null;

  const cacheKey = `${bucket}/${path}`;
  const cached = urlCache[cacheKey];
  
  if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (error) throw error;
    
    if (data?.signedUrl) {
      urlCache[cacheKey] = {
        url: data.signedUrl,
        expiresAt: Date.now() + 3600 * 1000,
      };
      return data.signedUrl;
    }
    return null;
  } catch (err) {
    console.error("Error creating signed URL:", err);
    return null;
  }
}
