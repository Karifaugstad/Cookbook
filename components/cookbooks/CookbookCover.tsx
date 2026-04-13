import Image from "next/image";
import { getSupabaseStorageObjectUrl } from "@/lib/utils";

interface CookbookCoverProps {
  title: string;
  coverStorageKey?: string | null;
}

const EMOJI_SETS = [
  "🍅 🥖 🍝",
  "🥑 🥗 🍋",
  "🧄 🧅 🍲",
  "🌮 🌶️ 🫘",
  "🍣 🥢 🍚",
  "🥐 🧈 🍓",
  "🍜 🍄 🥬",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function CookbookCover({ title, coverStorageKey }: CookbookCoverProps) {
  if (coverStorageKey) {
    return (
      <div className="relative aspect-[4/3] bg-border overflow-hidden">
        <Image
          src={getSupabaseStorageObjectUrl("recipe-photos", coverStorageKey)}
          alt={`Forside for ${title}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    );
  }

  const seed = hashString(title);
  const emoji = EMOJI_SETS[seed % EMOJI_SETS.length];

  return (
    <div className="aspect-[4/3] bg-primary/10 border-b border-border px-4 py-4 flex flex-col justify-between">
      <p className="text-xs uppercase tracking-widest text-primary">Kokebok</p>
      <p className="text-lg font-bold leading-tight text-[#1A1A1A] line-clamp-3">{title}</p>
      <p className="text-primary text-xl">{emoji}</p>
    </div>
  );
}
