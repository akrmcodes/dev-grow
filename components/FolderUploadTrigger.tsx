"use client";

import { useState } from "react";
import {
  AnimatedFolder,
  MiniFolderGlyph,
} from "@/components/ui/3d-folder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type FolderUploadTriggerProps = {
  language: Language;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

/**
 * Attach control: mini folder glyph + instant 3D folder flyout on hover.
 */
export function FolderUploadTrigger({
  language,
  disabled = false,
  onClick,
  className,
}: FolderUploadTriggerProps) {
  const [hovered, setHovered] = useState(false);
  const label = t("uploadFile", language);

  return (
    <div
      className={cn("relative shrink-0", className)}
      onMouseEnter={() => {
        if (!disabled) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => {
        if (!disabled) setHovered(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHovered(false);
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          delay={hovered ? 10_000 : 400}
          disabled={disabled || hovered}
          render={
            <button
              type="button"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              aria-label={label}
              className={cn(
                "relative flex size-7 shrink-0 items-center justify-center rounded-full outline-none",
                "text-foreground/50 transition-all duration-200",
                "hover:bg-accent/60 hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-40",
                hovered && "bg-accent/70 text-foreground",
              )}
            />
          }
        >
          <MiniFolderGlyph open={hovered} />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="border border-border/40 px-2 py-1 text-[11px] font-medium tracking-wide shadow-sm"
        >
          {label}
        </TooltipContent>
      </Tooltip>

      {/* Instant open flyout — stays in hover hit area */}
      <div
        className={cn(
          "pointer-events-none absolute end-0 bottom-[calc(100%+10px)] z-50 origin-bottom-right",
          "transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          hovered && !disabled
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100 blur-0"
            : "translate-y-2 scale-[0.96] opacity-0 blur-[2px]",
        )}
        aria-hidden={!hovered}
      >
        <AnimatedFolder
          title={t("uploadFolderTitle", language)}
          subtitle={t("uploadFolderSubtitle", language)}
          hint={t("uploadFolderHint", language)}
          size="sm"
          open={hovered && !disabled}
          onActivate={onClick}
          className="shadow-2xl shadow-black/20 dark:shadow-black/50"
        />
      </div>
    </div>
  );
}
