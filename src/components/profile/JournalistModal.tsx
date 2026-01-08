import { useState } from "react";
import { X, Send, Paperclip, FileText, User, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Journalist {
  id: string;
  name: string;
  media: string;
  email: string;
}

interface JournalistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJournalists: Journalist[];
}

export const JournalistModal = ({ isOpen, onClose, selectedJournalists }: JournalistModalProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("L'objet du mail est requis");
      return;
    }
    if (!message.trim()) {
      toast.error("Le contenu du message est requis");
      return;
    }

    setIsSending(true);
    
    // Simulate sending (to be replaced with actual edge function)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Communiqué envoyé à ${selectedJournalists.length} journaliste${selectedJournalists.length > 1 ? 's' : ''}`);
    setIsSending(false);
    setSubject("");
    setMessage("");
    setAttachment(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Envoyer un communiqué</h2>
              <p className="text-sm text-muted-foreground">
                {selectedJournalists.length} destinataire{selectedJournalists.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Recipients */}
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Destinataires</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedJournalists.map(journalist => (
              <div
                key={journalist.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {journalist.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-foreground">{journalist.name}</span>
                <span className="text-xs text-muted-foreground">({journalist.media})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Subject */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Objet du mail
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: [CP] Lancement de notre nouvelle offre..."
              className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Corps du message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour,&#10;&#10;Nous avons le plaisir de vous annoncer..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              Pièce jointe (PDF)
            </label>
            
            {attachment ? (
              <div className="flex items-center justify-between px-4 py-3 bg-success/10 border border-success/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  className="text-sm text-destructive hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Cliquez pour ajouter votre communiqué de presse
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 px-4 py-3 bg-secondary/50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible. Une fois configurée, vos emails seront envoyés directement aux journalistes sélectionnés.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer le communiqué
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
