"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { AnimatedFolder } from "@/components/ui/3d-folder";
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
        {isDragging && !disabled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl",
              "border border-dashed border-foreground/25 bg-background/70 backdrop-blur-md",
            )}
          >
            <AnimatedFolder
              title={t("dropZoneLabel", language)}
              subtitle={t("uploadFolderSubtitle", language)}
              hint=""
              size="lg"
              open
              interactive={false}
              className="border-foreground/20 shadow-2xl"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
