"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { handleFileUpload } from "@/lib/handle-file-upload";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type FileDropZoneProps = {
  children: React.ReactNode;
  language: Language;
  onFileLoad: (content: string, filename: string) => void;
  disabled?: boolean;
};

export function FileDropZone({
  children,
  language,
  onFileLoad,
  disabled = false,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const processFile = useCallback(
    async (file: File) => {
      await handleFileUpload(file, language, onFileLoad);
    },
    [language, onFileLoad],
  );

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;

    if (event.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;

    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      void processFile(file);
    }
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      <AnimatePresence>
        {isDragging && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl",
              "border-2 border-dashed border-primary/40 bg-primary/5 backdrop-blur-md",
            )}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <FolderOpen className="size-8 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">
                {t("dropZoneLabel", language)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
