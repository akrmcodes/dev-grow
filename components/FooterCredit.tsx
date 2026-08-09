"use client";

import { LinkPreview } from "@/components/ui/link-preview";
import { type Language, t } from "@/lib/translations";

const PROFILE_URL = "https://github.com/akrmcodes";
const REPO_URL = "https://github.com/akrmcodes/dev-grow";

type FooterCreditProps = {
  language: Language;
};

/**
 * Compact footer credit with Aceternity link previews for profile + repo.
 */
export function FooterCredit({ language }: FooterCreditProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
      <span>{t("footerBuiltBy", language)}</span>
      <LinkPreview url={PROFILE_URL} className="font-medium">
        akrmcodes
      </LinkPreview>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <LinkPreview url={REPO_URL} className="font-medium">
        {t("footerViewSource", language)}
      </LinkPreview>
    </div>
  );
}
