import { supabase } from "@/integrations/supabase/client";

const MEDIA_BUCKET = "media_assets";

interface SignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

const urlCache: SignedUrlCache = {};
const CACHE_BUFFER = 5 * 60 * 1000;

export async function getMediaSignedUrl(storagePath: string | null): Promise<string | null> {
  if (!storagePath) return null;

  const cacheKey = `${MEDIA_BUCKET}/${storagePath}`;
  const cached = urlCache[cacheKey];

  if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(storagePath, 3600);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    if (data?.signedUrl) {
      urlCache[cacheKey] = {
        url: data.signedUrl,
        expiresAt: Date.now() + 3600 * 1000,
      };
      return data.signedUrl;
    }
    return null;
  } catch (error) {
    console.error("Error in getMediaSignedUrl:", error);
    return null;
  }
}

export async function resolveMediaUrl<T extends { storage_path?: string | null }>(
  item: T,
  fallbackUrlField: keyof T
): Promise<string | null> {
  if (item.storage_path) {
    const signedUrl = await getMediaSignedUrl(item.storage_path);
    if (signedUrl) return signedUrl;
  }
  
  const fallback = item[fallbackUrlField];
  return typeof fallback === "string" ? fallback : null;
}

export async function resolveMediaUrls<T extends { storage_path?: string | null; id?: string }>(
  items: T[],
  fallbackUrlField: keyof T
): Promise<Map<string, string | null>> {
  const urlMap = new Map<string, string | null>();

  const signedUrlPromises = items
    .filter((item) => item.storage_path)
    .map(async (item) => {
      const url = await getMediaSignedUrl(item.storage_path!);
      return { id: item.id || item.storage_path!, url };
    });

  const results = await Promise.all(signedUrlPromises);

  for (const { id, url } of results) {
    urlMap.set(id!, url);
  }

  for (const item of items) {
    const id = item.id || String(item.storage_path);
    if (!urlMap.has(id!)) {
      const fallback = item[fallbackUrlField];
      urlMap.set(id!, typeof fallback === "string" ? fallback : null);
    }
  }

  return urlMap;
}

export function clearMediaUrlCache(): void {
  Object.keys(urlCache).forEach((key) => delete urlCache[key]);
}
