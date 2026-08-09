"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TubelightNavItem = {
  /** Stable id used for the active lamp indicator */
  name: string;
  /** Visible label (defaults to `name`) */
  label?: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
  ariaLabel?: string;
};

type NavBarProps = {
  items: TubelightNavItem[];
  className?: string;
  /** Controlled active tab name; defaults to first item / last clicked */
  activeTab?: string;
  onActiveTabChange?: (name: string) => void;
};

/**
 * Serenity UI / 21st.dev Tubelight Navbar — glowing active pill indicator.
 * Colors and structure preserved from the original component.
 */
export function NavBar({
  items,
  className,
  activeTab: activeTabProp,
  onActiveTabChange,
}: NavBarProps) {
  const [uncontrolledActive, setUncontrolledActive] = useState(
    items[0]?.name ?? "",
  );
  const activeTab = activeTabProp ?? uncontrolledActive;

  const setActiveTab = (name: string) => {
    if (activeTabProp === undefined) {
      setUncontrolledActive(name);
    }
    onActiveTabChange?.(name);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:bottom-auto sm:mb-0 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 rounded-full border border-border bg-background/5 px-1 py-1 shadow-lg backdrop-blur-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          const sharedClassName = cn(
            "relative cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors",
            "text-foreground/80 hover:text-primary",
            isActive && "bg-muted text-primary",
          );

          const content = (
            <>
              <span className="hidden md:inline">{item.label ?? item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} aria-hidden="true" />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-primary/5"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
                    <div className="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                  </div>
                </motion.div>
              )}
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.name}
                type="button"
                aria-label={item.ariaLabel ?? item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  item.onClick?.();
                }}
                className={sharedClassName}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.url ?? "#"}
              onClick={() => setActiveTab(item.name)}
              className={sharedClassName}
              aria-label={item.ariaLabel ?? item.name}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
