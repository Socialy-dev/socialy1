import { supabase } from "@/integrations/supabase/client";

export async function getSignedStorageUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error in getSignedStorageUrl:", error);
    return null;
  }
}

export function extractStoragePath(url: string | null, bucket: string): string | null {
  if (!url) return null;
  
  const regex = new RegExp(`${bucket}/(.+)$`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function uploadToPrivateStorage(
  bucket: string,
  file: File,
  userId: string,
  prefix = ""
): Promise<{ path: string; signedUrl: string } | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${prefix}${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const signedUrl = await getSignedStorageUrl(bucket, filePath);
    if (!signedUrl) return null;

    return { path: filePath, signedUrl };
  } catch (error) {
    console.error("Error in uploadToPrivateStorage:", error);
    return null;
  }
}
