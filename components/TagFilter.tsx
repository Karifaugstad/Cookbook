"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TagFilter({
  tags,
  active,
}: {
  tags: string[];
  active: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (tags.length === 0) return null;

  function handleClick(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (active === tag) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleClick(tag)}
          className={`px-3 py-1 text-xs border transition-colors ${
            active === tag
              ? "bg-primary text-white border-primary"
              : "border-border hover:border-primary"
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
