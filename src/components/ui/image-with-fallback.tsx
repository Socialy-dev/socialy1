import { useState, useEffect } from "react";
import { ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMediaSignedUrl } from "@/lib/media-storage";

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  isVideo?: boolean;
  dominantColor?: string | null;
  storagePath?: string | null;
  storageBucket?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClassName,
  isVideo = false,
  dominantColor,
  storagePath,
  storageBucket = "media_assets",
  onLoad,
  onError,
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);

    const resolveUrl = async () => {
      if (storagePath) {
        const signedUrl = await getMediaSignedUrl(storagePath);
        if (signedUrl) {
          setResolvedSrc(signedUrl);
        } else {
          setResolvedSrc(src || null);
        }
      } else {
        setResolvedSrc(src || null);
      }
      
      if (!storagePath && !src) {
        setIsLoading(false);
      }
    };

    resolveUrl();
  }, [src, storagePath, storageBucket]);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const fallbackBg = dominantColor
    ? { backgroundColor: dominantColor }
    : undefined;

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted/30",
          fallbackClassName
        )}
        style={fallbackBg}
      >
        {isVideo ? (
          <Video className="w-12 h-12 text-muted-foreground/40" />
        ) : (
          <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted/30 animate-pulse",
            fallbackClassName
          )}
          style={fallbackBg}
        >
          {isVideo ? (
            <Video className="w-12 h-12 text-muted-foreground/40" />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
          )}
        </div>
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className={cn(className, isLoading && "opacity-0")}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};
