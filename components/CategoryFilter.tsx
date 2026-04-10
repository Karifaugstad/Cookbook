"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

const CATEGORIES: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "breakfast", label: "Frokost" },
  { value: "lunch", label: "Lunsj" },
  { value: "dinner", label: "Middag" },
];

export default function CategoryFilter({
  active,
}: {
  active: Category | "all";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(value: Category | "all") {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleClick(value)}
          className={`px-4 py-1.5 text-sm border transition-colors ${
            active === value
              ? "bg-primary text-white border-primary"
              : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
