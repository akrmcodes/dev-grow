"use client";

import {
  forwardRef,
  useState,
  type CSSProperties,
} from "react";
import { motion } from "motion/react";
import {
  Braces,
  FileCode2,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FolderFile = {
  id: string;
  title: string;
  extension: string;
  icon: LucideIcon;
};

export const DEFAULT_CODE_FILES: FolderFile[] = [
  { id: "tsx", title: "component", extension: ".tsx", icon: FileCode2 },
  { id: "py", title: "main", extension: ".py", icon: Terminal },
  { id: "js", title: "utils", extension: ".js", icon: Braces },
];

type FolderSize = "sm" | "md" | "lg";

const SIZE: Record<
  FolderSize,
  {
    stage: string;
    stageStyle: CSSProperties;
    back: string;
    front: string;
    tab: string;
    tabStyle: CSSProperties;
    frontStyle: CSSProperties;
    card: string;
    title: string;
  }
> = {
  sm: {
    stage: "mb-2 h-[120px] w-[150px]",
    stageStyle: {},
    back: "h-[72px] w-[96px]",
    front: "h-[72px] w-[96px]",
    tab: "h-3 w-9",
    tabStyle: {
      top: "calc(50% - 36px - 10px)",
      left: "calc(50% - 48px + 12px)",
    },
    frontStyle: { top: "calc(50% - 36px + 3px)" },
    card: "h-[84px] w-[60px]",
    title: "text-sm",
  },
  md: {
    stage: "mb-3 h-[160px] w-[200px]",
    stageStyle: {},
    back: "h-24 w-32",
    front: "h-24 w-32",
    tab: "h-4 w-12",
    tabStyle: {
      top: "calc(50% - 48px - 12px)",
      left: "calc(50% - 64px + 16px)",
    },
    frontStyle: { top: "calc(50% - 48px + 4px)" },
    card: "h-28 w-20",
    title: "text-base",
  },
  lg: {
    stage: "mb-4 h-[180px] w-[220px]",
    stageStyle: {},
    back: "h-[108px] w-[144px]",
    front: "h-[108px] w-[144px]",
    tab: "h-4 w-14",
    tabStyle: {
      top: "calc(50% - 54px - 12px)",
      left: "calc(50% - 72px + 18px)",
    },
    frontStyle: { top: "calc(50% - 54px + 5px)" },
    card: "h-32 w-24",
    title: "text-lg",
  },
};

const CARD_ROTATE = [-12, 0, 12] as const;
const CARD_X = {
  sm: [-40, 0, 40],
  md: [-55, 0, 55],
  lg: [-64, 0, 64],
} as const;
const CARD_Y = { sm: -68, md: -90, lg: -100 } as const;

const SPRING = "500ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const CARD_SPRING = "600ms cubic-bezier(0.34, 1.56, 0.64, 1)";

type CodeSheetProps = {
  file: FolderFile;
  delay: number;
  isVisible: boolean;
  index: number;
  size: FolderSize;
};

const CodeSheet = forwardRef<HTMLDivElement, CodeSheetProps>(
  function CodeSheet({ file, delay, isVisible, index, size }, ref) {
    const Icon = file.icon;
    const dims = SIZE[size];
    const x = CARD_X[size][index] ?? 0;
    const y = CARD_Y[size];
    const rotate = CARD_ROTATE[index] ?? 0;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute overflow-hidden rounded-lg border border-border bg-card shadow-xl",
          dims.card,
        )}
        style={{
          left: size === "sm" ? "-30px" : "-40px",
          top: size === "sm" ? "-42px" : "-56px",
          zIndex: 10 - index,
          transform: isVisible
            ? `translateY(${y}px) translateX(${x}px) rotate(${rotate}deg) scale(1)`
            : "translateY(0px) translateX(0px) rotate(0deg) scale(0.5)",
          opacity: isVisible ? 1 : 0,
          transition: `all ${CARD_SPRING} ${delay}ms`,
        }}
        aria-hidden="true"
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-muted/40 to-card p-2">
          <div className="mb-1.5 flex items-center gap-1">
            <span className="size-1 rounded-full bg-foreground/25" />
            <span className="size-1 rounded-full bg-foreground/20" />
            <span className="size-1 rounded-full bg-foreground/15" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background/60">
            <Icon
              className={cn(
                "text-foreground/70",
                size === "sm" ? "size-4" : "size-5",
              )}
              strokeWidth={1.6}
            />
            <span className="font-mono text-[9px] tracking-tight text-muted-foreground">
              {file.extension}
            </span>
          </div>
          <p className="mt-1.5 truncate font-mono text-[9px] text-foreground/80">
            {file.title}
            {file.extension}
          </p>
        </div>
      </div>
    );
  },
);

export type AnimatedFolderProps = {
  title: string;
  files?: FolderFile[];
  className?: string;
  size?: FolderSize;
  /** Controlled open — when set, internal hover is ignored. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onActivate?: () => void;
  hint?: string;
  subtitle?: string;
  /** Disable card interaction / pointer on the shell. */
  interactive?: boolean;
};

/**
 * 3D Folder — adapted from 21st.dev/@jatin-yadav05/components/3d-folder
 * for DevGrow: monochrome chrome + code sheets instead of photo cards.
 */
export function AnimatedFolder({
  title,
  files = DEFAULT_CODE_FILES,
  className,
  size = "md",
  open: openProp,
  onOpenChange,
  onActivate,
  hint = "Hover to explore",
  subtitle,
  interactive = true,
}: AnimatedFolderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const dims = SIZE[size];
  const sheets = files.slice(0, 3);
  const subtitleText =
    subtitle ?? `${sheets.length} ${sheets.length === 1 ? "file" : "files"}`;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate && interactive ? 0 : undefined}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={
        onActivate && interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
      onMouseEnter={() => {
        if (!isControlled) setOpen(true);
      }}
      onMouseLeave={() => {
        if (!isControlled) setOpen(false);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card",
        "transition-all duration-500 ease-out",
        interactive && "cursor-pointer hover:border-foreground/25 hover:shadow-xl",
        size === "sm" ? "p-4" : "p-6 md:p-8",
        className,
      )}
      style={{
        minWidth: size === "sm" ? 180 : size === "md" ? 240 : 280,
        minHeight: size === "sm" ? 210 : size === "md" ? 280 : 320,
        perspective: "1000px",
      }}
    >
      {/* Soft monochrome bloom */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 50% 72%, color-mix(in oklch, var(--foreground) 18%, transparent) 0%, transparent 70%)",
          opacity: open ? 0.14 : 0,
        }}
      />

      <div
        className={cn(
          "relative flex items-center justify-center",
          dims.stage,
        )}
        style={{ transformStyle: "preserve-3d", ...dims.stageStyle }}
      >
        {/* Back panel */}
        <div
          className={cn(
            "absolute rounded-lg bg-[var(--folder-back)] shadow-md",
            dims.back,
          )}
          style={{
            transformOrigin: "bottom center",
            transform: open ? "rotateX(-15deg)" : "rotateX(0deg)",
            transition: `transform ${SPRING}`,
            zIndex: 10,
          }}
        />

        {/* Tab */}
        <div
          className={cn(
            "absolute rounded-t-md bg-[var(--folder-tab)]",
            dims.tab,
          )}
          style={{
            ...dims.tabStyle,
            transformOrigin: "bottom center",
            transform: open
              ? "rotateX(-25deg) translateY(-2px)"
              : "rotateX(0deg)",
            transition: `transform ${SPRING}`,
            zIndex: 10,
          }}
        />

        {/* Code sheets */}
        <div
          className="absolute top-1/2 left-1/2 z-20"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          {sheets.map((file, index) => (
            <CodeSheet
              key={file.id}
              file={file}
              index={index}
              delay={index * 70}
              isVisible={open}
              size={size}
            />
          ))}
        </div>

        {/* Front panel */}
        <div
          className={cn(
            "absolute rounded-lg bg-[var(--folder-front)] shadow-lg",
            dims.front,
          )}
          style={{
            ...dims.frontStyle,
            transformOrigin: "bottom center",
            transform: open
              ? "rotateX(25deg) translateY(8px)"
              : "rotateX(0deg)",
            transition: `transform ${SPRING}`,
            zIndex: 30,
          }}
        />

        {/* Shine */}
        <div
          className={cn("pointer-events-none absolute rounded-lg", dims.front)}
          style={{
            ...dims.frontStyle,
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--foreground) 28%, transparent) 0%, transparent 52%)",
            transformOrigin: "bottom center",
            transform: open
              ? "rotateX(25deg) translateY(8px)"
              : "rotateX(0deg)",
            transition: `transform ${SPRING}`,
            zIndex: 31,
          }}
        />
      </div>

      <h3
        className={cn(
          "mt-2 font-semibold text-foreground transition-transform duration-300",
          dims.title,
        )}
        style={{ transform: open ? "translateY(4px)" : "translateY(0)" }}
      >
        {title}
      </h3>

      <p
        className="text-xs text-muted-foreground transition-opacity duration-300 sm:text-sm"
        style={{ opacity: open ? 0.7 : 1 }}
      >
        {subtitleText}
      </p>

      {hint ? (
        <div
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[10px] text-muted-foreground transition-all duration-300 sm:bottom-4 sm:text-xs"
          style={{
            opacity: open ? 0 : 0.55,
            transform: open ? "translateY(8px)" : "translateY(0)",
          }}
        >
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Compact folder glyph — three code icons fan out of the folder on open. */
export function MiniFolderGlyph({
  open = false,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  const rotates = [-26, 0, 26] as const;
  const offsetsX = [-14, 0, 14] as const;
  const sheetSpring = { type: "spring" as const, stiffness: 420, damping: 22, mass: 0.55 };
  const lidSpring = { type: "spring" as const, stiffness: 380, damping: 24, mass: 0.5 };

  return (
    <span
      className={cn(
        "relative inline-flex size-6 items-end justify-center",
        className,
      )}
      style={{ perspective: "220px", transformStyle: "preserve-3d" }}
      aria-hidden="true"
    >
      {DEFAULT_CODE_FILES.map((file, index) => {
        const Icon = file.icon;
        return (
          <motion.span
            key={file.id}
            className="absolute bottom-2 flex size-4 items-center justify-center rounded-[4px] border border-border/80 bg-card text-foreground shadow-md will-change-transform"
            initial={false}
            animate={
              open
                ? {
                    x: offsetsX[index],
                    y: -16,
                    rotate: rotates[index],
                    scale: 1,
                    opacity: 1,
                  }
                : {
                    x: 0,
                    y: 3,
                    rotate: 0,
                    scale: 0.28,
                    opacity: 0,
                  }
            }
            transition={{
              ...sheetSpring,
              delay: open ? index * 0.04 : (2 - index) * 0.03,
              opacity: { duration: open ? 0.18 : 0.12, delay: open ? index * 0.04 : 0 },
            }}
            style={{
              zIndex: 5 - index,
              transformOrigin: "50% 100%",
            }}
          >
            <Icon className="size-3" strokeWidth={2} />
          </motion.span>
        );
      })}

      {/* Back panel — soft gray via currentColor to match sibling toolbar icons */}
      <motion.span
        className="absolute bottom-0 h-3 w-4 rounded-[3px] bg-current/30 will-change-transform"
        initial={false}
        animate={{ rotateX: open ? 20 : 0, y: open ? 0.5 : 0 }}
        transition={lidSpring}
        style={{ zIndex: 1, transformOrigin: "bottom center" }}
      />
      {/* Tab */}
      <motion.span
        className="absolute bottom-[10px] start-[2.5px] h-1 w-2 rounded-t-[2px] bg-current/22 will-change-transform"
        initial={false}
        animate={{
          rotateX: open ? -22 : 0,
          y: open ? -1 : 0,
        }}
        transition={lidSpring}
        style={{ zIndex: 1, transformOrigin: "bottom center" }}
      />
      {/* Front panel */}
      <motion.span
        className="absolute bottom-0 h-3 w-4 rounded-[3px] bg-current/48 will-change-transform"
        initial={false}
        animate={{
          rotateX: open ? -28 : 0,
          y: open ? -0.5 : 0,
        }}
        transition={lidSpring}
        style={{ zIndex: 6, transformOrigin: "bottom center" }}
      />
      {/* Shine on front */}
      <motion.span
        className="pointer-events-none absolute bottom-0 h-3 w-4 rounded-[3px] will-change-transform"
        initial={false}
        animate={{
          rotateX: open ? -28 : 0,
          y: open ? -0.5 : 0,
        }}
        transition={lidSpring}
        style={{
          zIndex: 7,
          transformOrigin: "bottom center",
          background:
            "linear-gradient(135deg, color-mix(in oklch, var(--background) 45%, transparent) 0%, transparent 55%)",
        }}
      />
    </span>
  );
}


