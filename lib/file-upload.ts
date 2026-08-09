export const MAX_FILE_SIZE_BYTES = 100 * 1024;

export const ALLOWED_CODE_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".rb",
  ".go",
  ".rs",
  ".php",
  ".sql",
  ".json",
  ".xml",
  ".md",
  ".txt",
]);

export const FILE_INPUT_ACCEPT = Array.from(ALLOWED_CODE_EXTENSIONS).join(",");

export function getFileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }

  return name.slice(dotIndex).toLowerCase();
}

export function isAllowedCodeFile(file: File): boolean {
  return ALLOWED_CODE_EXTENSIONS.has(getFileExtension(file.name));
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read file as text."));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file."));
    };

    reader.readAsText(file);
  });
}
