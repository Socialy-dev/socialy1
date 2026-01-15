import { useState } from "react";
import { X, Send, Sparkles, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
            time: "10:30"
        }
    ]);

    const handleSend = () => {
        if (!message.trim()) return;

        setMessages([...messages, {
            role: "user",
            content: message,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessage("");

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Je traite votre demande...",
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Side Panel */}
            <div
                className={cn(
                    "fixed right-0 top-0 h-screen w-full md:w-[480px] bg-background border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-violet-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Assistant IA</h2>
                            <p className="text-xs text-muted-foreground">Toujours là pour vous aider</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-foreground" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={cn(
                                    "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-secondary text-foreground rounded-tl-sm"
                                )}
                            >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <span className={cn(
                                    "text-xs mt-1 block",
                                    msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                    {msg.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="px-6 py-3 border-t border-border bg-secondary/20">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Actions rapides</p>
                    <div className="flex gap-2 flex-wrap">
                        {["Résumer mes tâches", "Créer un post LinkedIn", "Analyser les stats"].map((action) => (
                            <button
                                key={action}
                                onClick={() => setMessage(action)}
                                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border hover:bg-secondary transition-colors"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="p-6 border-t border-border bg-background">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Posez votre question..."
                                className="w-full px-4 py-3 pr-20 rounded-2xl bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none min-h-[48px] max-h-32"
                                rows={1}
                            />
                            <div className="absolute right-2 bottom-2 flex gap-1">
                                <button className="w-8 h-8 rounded-lg hover:bg-background flex items-center justify-center transition-colors">
                                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button className="w-8 h-8 rounded-lg hover:bg-background flex items-center justify-center transition-colors">
                                    <Mic className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
