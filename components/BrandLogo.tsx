import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  title?: string;
};

/**
 * DevGrow mark — uses currentColor so it tracks light/dark foreground.
 */
export function BrandLogo({ className, title }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      className={cn("size-5 shrink-0", className)}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        d="M29.94,210.92L120.49,120.37H29.94L120.49,29.82H482.68V392.01l-90.55,90.55v-90.55l-90.55,90.55h-90.55v-90.55l-90.55,90.55H29.94v-90.55l90.55-90.55H29.94v-90.55h0Zm362.19,181.1V120.37H120.49v90.55h90.55l-90.55,90.55v90.55h90.55l90.55-90.55v90.55h90.55Z"
      />
    </svg>
  );
}
