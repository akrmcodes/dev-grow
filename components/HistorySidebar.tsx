"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MODE_CONFIG } from "@/lib/constants";
import type { ConversationMetadata } from "@/lib/chat-db";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type HistorySidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  conversations: ConversationMetadata[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onClearAll: () => void;
};

export function HistorySidebar({
  isOpen,
  onClose,
  language,
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
  onClearAll,
}: HistorySidebarProps) {
  const isRTL = language === "ar";
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleClearAll = () => {
    onClearAll();
    setIsClearDialogOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t("cancel", language)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={cn(
                "fixed top-0 bottom-0 z-50 flex w-full max-w-sm flex-col border-border bg-background shadow-xl",
                isRTL ? "right-0 border-s" : "left-0 border-e",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {t("historyTitle", language)}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("cancel", language)}
                  onClick={onClose}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="border-b border-border px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={onNewChat}
                >
                  <Plus className="size-4" />
                  {t("newChat", language)}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-2">
                {conversations.length === 0 ? (
                  <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                    {t("noHistory", language)}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {conversations.map((conversation) => {
                      const isActive = conversation.id === activeConversationId;

                      return (
                        <li key={conversation.id}>
                          <div
                            className={cn(
                              "group flex items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60",
                              isActive && "bg-muted",
                            )}
                          >
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-start"
                              onClick={() => onSelect(conversation.id)}
                            >
                              <div className="flex items-center gap-2">
                                <span aria-hidden="true" className="shrink-0">
                                  {MODE_CONFIG[conversation.mode].emoji}
                                </span>
                                <span className="truncate text-sm font-medium text-foreground">
                                  {conversation.title}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatTimeAgo(conversation.updatedAt, language)}
                              </p>
                            </button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="shrink-0 text-muted-foreground opacity-100 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                              aria-label={t("deleteConversation", language)}
                              onClick={(event) => {
                                event.stopPropagation();
                                onDelete(conversation.id);
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {conversations.length > 0 && (
                <div className="border-t border-border px-4 py-3">
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => setIsClearDialogOpen(true)}
                  >
                    {t("clearAllHistory", language)}
                  </Button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("clearAllConfirmTitle", language)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("clearAllConfirmDescription", language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel", language)}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleClearAll}
            >
              {t("confirm", language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
