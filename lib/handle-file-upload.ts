"use client";

import { toast } from "sonner";
import {
  isAllowedCodeFile,
  MAX_FILE_SIZE_BYTES,
  readFileAsText,
} from "@/lib/file-upload";
import { type Language, t } from "@/lib/translations";

export async function handleFileUpload(
  file: File,
  language: Language,
  onFileLoad: (content: string, filename: string) => void,
): Promise<void> {
  if (!isAllowedCodeFile(file)) {
    toast.error(t("errorOnlyCodeFiles", language));
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error(t("errorFileTooLarge", language));
    return;
  }

  try {
    const content = await readFileAsText(file);
    onFileLoad(content, file.name);
  } catch {
    toast.error(t("errorGeneric", language));
  }
}
