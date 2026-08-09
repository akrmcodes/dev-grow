"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconX } from "@tabler/icons-react";

export interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  side,
  closeLabel = "Close sidebar",
  ...props
}: React.ComponentProps<typeof motion.div> & {
  /** Explicit side for mobile drawer animation (avoids post-mount dir flicker). */
  side?: "left" | "right";
  closeLabel?: string;
}) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar
        side={side}
        closeLabel={closeLabel}
        {...(props as React.ComponentProps<"div">)}
      />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
        className={cn(
        "hidden h-full w-[300px] shrink-0 flex-col overflow-visible border-border bg-muted/40 px-4 py-4 md:flex dark:bg-muted/20",
        "border-e",
        className,
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      transition={{
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Mobile overlay only — chrome toggle lives in AppHeader (avoids a duplicate bar).
 * Pass `side` explicitly so the drawer never flashes from the wrong edge on open.
 */
export const MobileSidebar = ({
  className,
  children,
  side = "left",
  closeLabel = "Close sidebar",
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  closeLabel?: string;
}) => {
  const { open, setOpen } = useSidebar();
  const exitX = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-sidebar"
          initial={{ x: exitX, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: exitX, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={cn(
            "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-background p-6 md:hidden",
            className,
          )}
        >
          <button
            type="button"
            className="absolute top-6 end-6 z-50 text-foreground"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
          >
            <IconX className="size-5" />
          </button>
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "group/sidebar flex items-center justify-start gap-2 py-2",
        className,
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="m-0! inline-block p-0! text-sm whitespace-pre text-foreground transition duration-150 group-hover/sidebar:translate-x-1 rtl:group-hover/sidebar:-translate-x-1"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

/** Label that respects collapsed / expanded sidebar state (for custom rows). */
export function SidebarLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, animate } = useSidebar();
  return (
    <motion.span
      animate={{
        display: animate ? (open ? "inline-block" : "none") : "inline-block",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className={cn(
        "m-0! inline-block min-w-0 truncate p-0! text-sm whitespace-pre text-foreground transition duration-150",
        className,
      )}
    >
      {children}
    </motion.span>
  );
}
