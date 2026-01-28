import { useState, useEffect } from "react";
import { ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  isVideo?: boolean;
  dominantColor?: string | null;
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
  onLoad,
  onError,
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

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

  if (!src || hasError) {
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
        src={src}
        alt={alt}
        className={cn(className, isLoading && "opacity-0")}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};
