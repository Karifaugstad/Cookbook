import Image from "next/image";
import { Profile } from "@/lib/types";

interface UserAvatarProps {
  profile: Pick<Profile, "display_name" | "avatar_url">;
  size?: number;
}

export default function UserAvatar({ profile, size = 36 }: UserAvatarProps) {
  const initials = profile.display_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (profile.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.display_name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
