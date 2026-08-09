"use client";

import { useState } from "react";
import { MiniFolderGlyph } from "@/components/ui/3d-folder";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type FolderUploadTriggerProps = {
  language: Language;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

/**
 * Attach control — the folder icon itself opens and fans three code icons upward.
 */
export function FolderUploadTrigger({
  language,
  disabled = false,
  onClick,
  className,
}: FolderUploadTriggerProps) {
  const [hovered, setHovered] = useState(false);
  const open = hovered && !disabled;
  const label = t("uploadFile", language);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => {
        if (!disabled) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        if (!disabled) setHovered(true);
      }}
      onBlur={() => setHovered(false)}
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center overflow-visible rounded-full outline-none",
        "text-foreground/50 transition-colors duration-200",
        "hover:bg-accent/60 hover:text-foreground/70",
        "disabled:pointer-events-none disabled:opacity-40",
        open && "bg-accent/70 text-foreground/70",
        className,
      )}
    >
      <MiniFolderGlyph open={open} />
    </button>
  );
}
