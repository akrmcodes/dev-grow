"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CodeEditor } from "@/components/CodeEditor";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

type Language = "en" | "ar";

export function AppShell() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("en");

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRTL, language]);

  const handleLanguageToggle = () => {
    setLanguage((current) => (current === "en" ? "ar" : "en"));
  };

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        isRTL && "font-arabic",
      )}
    >
      <AppHeader language={language} onLanguageToggle={handleLanguageToggle} />

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-[400px] flex-col bg-surface/50 p-4 md:min-h-0 md:p-6">
          <CodeEditor value={code} onChange={setCode} isRTL={isRTL} />
        </section>

        <section className="flex min-h-[320px] flex-col md:min-h-0">
          <Sidebar isRTL={isRTL} />
        </section>
      </main>

      <footer className="shrink-0 border-t border-border py-3 text-center text-xs text-muted-foreground">
        Powered by OpenRouter · google/gemma-4-31b-it:free
      </footer>
    </div>
  );
}
