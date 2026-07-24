"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  PromptInput,
  type PromptInputHandle,
} from "@/components/ui/ai-chat-input";
import { Badge } from "@/components/ui/badge";
import { FolderUploadTrigger } from "@/components/FolderUploadTrigger";
import { MODE_CONFIG } from "@/lib/constants";
import { FILE_INPUT_ACCEPT } from "@/lib/file-upload";
import type { Mode } from "@/lib/prompts";
import { type Language, t } from "@/lib/translations";

export type ChatInputHandle = {
  focus: () => void;
};

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  activeMode: Mode | null;
  onModeChange: (mode: Mode) => void;
  isStreaming: boolean;
  canSend: boolean;
  onSend: () => void;
  onStop: () => void;
  language: Language;
  uploadedFilename: string | null;
  onFileSelect: (file: File) => void;
};

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      activeMode,
      onModeChange,
      isStreaming,
      canSend,
      onSend,
      onStop,
      language,
      uploadedFilename,
      onFileSelect,
    },
    ref,
  ) {
    const promptRef = useRef<PromptInputHandle>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lineCount = value === "" ? 1 : value.split("\n").length;

    useImperativeHandle(ref, () => ({
      focus: () => {
        promptRef.current?.focus();
      },
    }));

    const handleFileInputChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      event.target.value = "";
    };

    const fileBadgeLabel = uploadedFilename
      ? t("fileBadge", language)
          .replace("{name}", uploadedFilename)
          .replace("{lines}", String(lineCount))
      : null;

    return (
      <div className="relative z-10 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_INPUT_ACCEPT}
          className="hidden"
          onChange={handleFileInputChange}
        />

        {fileBadgeLabel ? (
          <div className="mb-2 flex justify-center">
            <Badge variant="outline" className="font-mono text-[10px]">
              {fileBadgeLabel}
            </Badge>
          </div>
        ) : null}

        <div className="w-full">
          <PromptInput
            ref={promptRef}
            value={value}
            onChange={onChange}
            onSubmit={() => onSend()}
            placeholder={t("codePlaceholder", language)}
            activeMode={activeMode}
            onModeChange={onModeChange}
            getModeLabel={(mode) => t(MODE_CONFIG[mode].labelKey, language)}
            isStreaming={isStreaming}
            onStop={onStop}
            canSend={canSend}
            onAttachClick={() => fileInputRef.current?.click()}
            attachDisabled={isStreaming}
            attachSlot={
              <FolderUploadTrigger
                language={language}
                disabled={isStreaming}
                onClick={() => fileInputRef.current?.click()}
              />
            }
            mono
            clearOnSubmit
            language={language}
          />
        </div>

        <p
          className="mt-1.5 text-center text-[10px] text-muted-foreground"
          aria-live="polite"
        >
          {`${lineCount} ${lineCount === 1 ? t("line", language) : t("lines", language)}`}
        </p>
      </div>
    );
  },
);
