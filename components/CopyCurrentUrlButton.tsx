"use client";

import { useState } from "react";

interface CopyCurrentUrlButtonProps {
  compact?: boolean;
  iconOnly?: boolean;
}

export default function CopyCurrentUrlButton({
  compact = false,
  iconOnly = false,
}: CopyCurrentUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className={
          compact
            ? `inline-flex items-center border border-border hover:border-primary transition-colors ${
                iconOnly
                  ? copied
                    ? "justify-center h-10 px-3 text-xs uppercase tracking-widest"
                    : "justify-center w-10 h-10"
                  : "gap-1.5 px-3 py-2 text-xs uppercase tracking-widest"
              }`
            : "text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
        }
        aria-label="Kopier lenke"
        title="Kopier lenke"
      >
        {compact && iconOnly && !copied && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        {compact && iconOnly && copied && "Lenke kopiert!"}
        {compact && !iconOnly && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
            <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
          </svg>
        )}
        {!iconOnly && (copied ? "Lenke kopiert!" : compact ? "Del" : "Kopier lenke")}
      </button>
    </div>
  );
}
