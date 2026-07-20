"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isRTL: boolean;
};

const modes = Object.keys(MODE_CONFIG) as Mode[];

export function Sidebar({ isRTL }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-[320px] flex-col px-4 py-3 md:border-l md:border-border",
      )}
    >
      <Card size="sm" className="shrink-0">
        <CardHeader>
          <CardTitle className="text-sm">
            {isRTL ? "اختر وضعاً" : "Select a mode"}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? "سيتم تفعيل الأوضاع في المرحلة التالية"
              : "Modes will be activated in the next stage"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {modes.map((mode) => {
              const config = MODE_CONFIG[mode];
              return (
                <Button
                  key={mode}
                  variant="outline"
                  size="sm"
                  disabled
                  className="gap-1.5 opacity-60"
                  aria-disabled="true"
                >
                  <span aria-hidden="true">{config.emoji}</span>
                  <span>{isRTL ? config.labelAr : config.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="mt-3 min-h-[200px] flex-1">
        <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
          <MessageSquare
            className="size-8 text-muted-foreground/60"
            aria-hidden="true"
          />
          <p className="max-w-[220px] text-sm text-muted-foreground">
            {isRTL
              ? "ستظهر الردود هنا"
              : "Responses will appear here"}
          </p>
        </CardContent>
      </Card>

      <details className="mt-3 shrink-0 rounded-xl border border-border bg-card ring-1 ring-foreground/10">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            {isRTL ? "تقييم الكود 📊" : "Code Score 📊"}
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              ▾
            </span>
          </span>
        </summary>
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {isRTL
            ? "سيظهر التقييم هنا بعد المراجعة"
            : "Scores will appear here after review"}
        </div>
      </details>
    </aside>
  );
}
