"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { GooeyInput } from "@/components/ui/gooey-input";
import {
  Sidebar,
  SidebarBody,
  SidebarLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { MODE_CONFIG } from "@/lib/constants";
import type { ConversationMetadata } from "@/lib/chat-db";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type HistorySidebarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  language: Language;
  conversations: ConversationMetadata[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onClearAll: () => void;
};

function BrandMark({ expanded }: { expanded: boolean }) {
  return (
    <div className="relative z-20 flex items-center gap-2 py-1 text-sm font-medium text-foreground">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-base"
        aria-hidden="true"
      >
        🌱
      </span>
      {expanded ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text whitespace-pre text-transparent"
        >
          DevGrow
        </motion.span>
      ) : null}
    </div>
  );
}

function Brand() {
  const { open, animate } = useSidebar();
  const showLabel = !animate || open;
  return <BrandMark expanded={showLabel} />;
}

function HistorySearch({
  language,
  value,
  onValueChange,
}: {
  language: Language;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { open, animate, setOpen } = useSidebar();
  const showControl = !animate || open;

  if (!showControl) {
    return (
      <button
        type="button"
        className="mt-4 flex size-7 items-center justify-center rounded-full border border-border bg-foreground text-background shadow-sm transition-opacity hover:opacity-90"
        aria-label={t("searchHistory", language)}
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" />
      </button>
    );
  }

  return (
    <div
      className="mt-4 overflow-visible"
      // Keep the rail open while interacting with the gooey control.
      onMouseEnter={() => setOpen(true)}
    >
      <GooeyInput
        value={value}
        onValueChange={onValueChange}
        placeholder={t("searchHistory", language)}
        collapsedWidth={128}
        expandedWidth={228}
        expandedOffset={44}
        gooeyBlur={5}
        className="justify-start"
        onOpenChange={(searchOpen) => {
          if (searchOpen) setOpen(true);
        }}
      />
    </div>
  );
}

function NewChatRow({
  language,
  onNewChat,
}: {
  language: Language;
  onNewChat: () => void;
}) {
  const { setOpen } = useSidebar();

  return (
    <button
      type="button"
      onClick={() => {
        onNewChat();
        setOpen(false);
      }}
      className="group/sidebar flex w-full items-center gap-2 rounded-lg px-1 py-2 text-start transition-colors hover:bg-muted/70"
      aria-label={t("newChat", language)}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground">
        <MessageSquarePlus className="size-4" />
      </span>
      <SidebarLabel className="font-medium">
        {t("newChat", language)}
      </SidebarLabel>
    </button>
  );
}

function ConversationRow({
  conversation,
  isActive,
  language,
  onSelect,
  onDelete,
}: {
  conversation: ConversationMetadata;
  isActive: boolean;
  language: Language;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { open, animate, setOpen } = useSidebar();
  const showMeta = !animate || open;

  return (
    <div
      className={cn(
        "group/sidebar flex items-center gap-1 rounded-lg px-1 py-1.5 transition-colors hover:bg-muted/70",
        isActive && "bg-muted",
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-start"
        onClick={() => {
          onSelect(conversation.id);
          setOpen(false);
        }}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center text-base"
          aria-hidden="true"
        >
          {MODE_CONFIG[conversation.mode].emoji}
        </span>
        <span className="min-w-0 flex-1">
          <SidebarLabel className="block font-medium">
            {conversation.title}
          </SidebarLabel>
          {showMeta ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-0.5 truncate text-[11px] text-muted-foreground"
            >
              {formatTimeAgo(conversation.updatedAt, language)}
            </motion.p>
          ) : null}
        </span>
      </button>

      {showMeta ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 shrink-0 text-muted-foreground opacity-100 hover:text-destructive md:opacity-0 md:group-hover/sidebar:opacity-100"
          aria-label={t("deleteConversation", language)}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(conversation.id);
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

function ClearAllRow({
  language,
  onRequestClear,
}: {
  language: Language;
  onRequestClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRequestClear}
      className="group/sidebar flex w-full items-center gap-2 rounded-lg px-1 py-2 text-start text-destructive transition-colors hover:bg-destructive/10"
      aria-label={t("clearAllHistory", language)}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10">
        <Trash2 className="size-4" />
      </span>
      <SidebarLabel className="font-medium text-destructive">
        {t("clearAllHistory", language)}
      </SidebarLabel>
    </button>
  );
}

function SidebarContent({
  language,
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
  onRequestClear,
}: {
  language: Language;
  conversations: ConversationMetadata[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onRequestClear: () => void;
}) {
  const { open, animate } = useSidebar();
  const [query, setQuery] = useState("");
  const showLabels = !animate || open;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(needle),
    );
  }, [conversations, query]);

  const showEmptyHistory = showLabels && conversations.length === 0;
  const showNoResults =
    showLabels && conversations.length > 0 && filtered.length === 0;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <Brand />

        <HistorySearch
          language={language}
          value={query}
          onValueChange={setQuery}
        />

        <div className="mt-4 flex flex-col gap-1">
          <NewChatRow language={language} onNewChat={onNewChat} />
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto">
          {showEmptyHistory ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              {t("noHistory", language)}
            </p>
          ) : showNoResults ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              {t("noSearchResults", language)}
            </p>
          ) : (
            filtered.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                language={language}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>

      {conversations.length > 0 ? (
        <div className="shrink-0 border-t border-border pt-3">
          <ClearAllRow language={language} onRequestClear={onRequestClear} />
        </div>
      ) : null}
    </>
  );
}

/**
 * Aceternity hover-expand sidebar adapted for DevGrow chat history.
 */
export function HistorySidebar({
  open,
  setOpen,
  language,
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
  onClearAll,
}: HistorySidebarProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const handleClearAll = () => {
    onClearAll();
    setIsClearDialogOpen(false);
    setOpen(false);
  };

  return (
    <>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 overflow-visible">
          <SidebarContent
            language={language}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={onSelect}
            onDelete={onDelete}
            onNewChat={onNewChat}
            onRequestClear={() => setIsClearDialogOpen(true)}
          />
        </SidebarBody>
      </Sidebar>

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
            <AlertDialogAction variant="destructive" onClick={handleClearAll}>
              {t("confirm", language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
