import { useState } from "react";
import { X, FileText, Calendar, RefreshCw, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MarketWatchDocument {
  id: string;
  organization_id: string;
  title: string;
  content: string | null;
  period_start: string;
  period_end: string;
  status: string;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MarketWatchDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MarketWatchDocument | null;
  isGenerating: boolean;
  onGenerate: (force?: boolean) => void;
}

export function MarketWatchDocumentModal({
  isOpen,
  onClose,
  document,
  isGenerating,
  onGenerate,
}: MarketWatchDocumentModalProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderContent = () => {
    if (!document) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Aucun document disponible
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Générez votre premier document de veille mensuel. Notre IA analysera tous vos sujets de veille et créera un résumé structuré.
          </p>
          <Button
            onClick={() => onGenerate(false)}
            disabled={isGenerating}
            size="lg"
            className="gap-3 px-8 py-6 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer le document
              </>
            )}
          </Button>
        </div>
      );
    }

    if (document.status === 'pending') {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse delay-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Document en cours de génération
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Notre IA analyse vos articles de veille et prépare votre résumé mensuel. Cette opération peut prendre quelques minutes.
          </p>
        </div>
      );
    }

    if (document.status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <X className="w-12 h-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Erreur de génération
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Une erreur est survenue lors de la génération du document. Veuillez réessayer.
          </p>
          <Button
            onClick={() => onGenerate(true)}
            disabled={isGenerating}
            size="lg"
            className="gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Régénération...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Réessayer
              </>
            )}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{document.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(document.period_start)} - {formatDate(document.period_end)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate(true)}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Régénérer
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <article className="max-w-4xl mx-auto px-8 py-10">
            {document.content ? (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-0 prose-h1:border-b prose-h1:border-border prose-h1:pb-6
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-primary
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:my-6 prose-li:text-muted-foreground prose-li:mb-2
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                  prose-hr:border-border prose-hr:my-10
                "
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(document.content) }}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Le contenu du document n'est pas encore disponible.
              </div>
            )}
          </article>
        </div>

        {document.generated_at && (
          <div className="px-8 py-4 border-t border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground text-center">
              Généré le {formatDate(document.generated_at)} à{" "}
              {new Date(document.generated_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-7xl md:rounded-3xl bg-background border border-border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-all group"
        >
          <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {renderContent()}
      </div>
    </div>
  );
}

function formatMarkdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  html = html.replace(/---/g, '<hr />');

  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><(h[1-3]|ul|blockquote|hr)/g, '<$1');
  html = html.replace(/<\/(h[1-3]|ul|blockquote)><\/p>/g, '</$1>');
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<hr \/><\/p>/g, '<hr />');

  return html;
}
