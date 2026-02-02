import { useState, useEffect, useCallback } from "react";
import { getMediaSignedUrl } from "@/lib/media-storage";

interface MediaUrlState {
  url: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMediaUrl(
  storagePath: string | null | undefined,
  fallbackUrl: string | null | undefined
): MediaUrlState & { refresh: () => void } {
  const [state, setState] = useState<MediaUrlState>({
    url: null,
    isLoading: !!storagePath,
    error: null,
  });

  const resolveUrl = useCallback(async () => {
    if (storagePath) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const signedUrl = await getMediaSignedUrl(storagePath);
        setState({
          url: signedUrl || fallbackUrl || null,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState({
          url: fallbackUrl || null,
          isLoading: false,
          error: err instanceof Error ? err : new Error("Failed to get signed URL"),
        });
      }
    } else {
      setState({
        url: fallbackUrl || null,
        isLoading: false,
        error: null,
      });
    }
  }, [storagePath, fallbackUrl]);

  useEffect(() => {
    resolveUrl();
  }, [resolveUrl]);

  return { ...state, refresh: resolveUrl };
}

interface BatchMediaUrls {
  [id: string]: string | null;
}

export function useMediaUrls<T extends { id: string; storage_path?: string | null }>(
  items: T[],
  getFallbackUrl: (item: T) => string | null | undefined
): { urls: BatchMediaUrls; isLoading: boolean } {
  const [urls, setUrls] = useState<BatchMediaUrls>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveAllUrls = async () => {
      if (!items.length) {
        setUrls({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const results: BatchMediaUrls = {};

      const promises = items.map(async (item) => {
        if (item.storage_path) {
          const signedUrl = await getMediaSignedUrl(item.storage_path);
          results[item.id] = signedUrl || getFallbackUrl(item) || null;
        } else {
          results[item.id] = getFallbackUrl(item) || null;
        }
      });

      await Promise.all(promises);
      setUrls(results);
      setIsLoading(false);
    };

    resolveAllUrls();
  }, [items, getFallbackUrl]);

  return { urls, isLoading };
}
