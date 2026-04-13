"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FriendshipStatus } from "@/lib/social";

interface FriendRequestButtonProps {
  targetUserId: string;
  currentUserId: string | null;
  initialStatus: FriendshipStatus;
  initialFriendshipId: string | null;
}

export default function FriendRequestButton({
  targetUserId,
  currentUserId,
  initialStatus,
  initialFriendshipId,
}: FriendRequestButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [friendshipId, setFriendshipId] = useState(initialFriendshipId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!currentUserId) {
    return (
      <a
        href="/login"
        className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-primary transition-colors"
      >
        Logg inn for å bli venner
      </a>
    );
  }

  async function sendRequest() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("friendships")
      .insert({ sender_id: currentUserId, receiver_id: targetUserId, status: "pending" })
      .select("id")
      .single();
    if (data) {
      setFriendshipId(data.id);
      setStatus("pending_sent");
    }
    setLoading(false);
  }

  async function cancelRequest() {
    if (!friendshipId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setFriendshipId(null);
    setStatus("none");
    setLoading(false);
  }

  async function acceptRequest() {
    if (!friendshipId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    setStatus("accepted");
    setLoading(false);
    router.refresh();
  }

  async function declineRequest() {
    if (!friendshipId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setFriendshipId(null);
    setStatus("none");
    setLoading(false);
  }

  async function unfriend() {
    if (!friendshipId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setFriendshipId(null);
    setStatus("none");
    setLoading(false);
  }

  const btnBase =
    "text-xs uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50";

  if (status === "none") {
    return (
      <button
        onClick={sendRequest}
        disabled={loading}
        className={`${btnBase} bg-primary text-white hover:bg-primary-dark`}
      >
        {loading ? "..." : "Send venneforespørsel"}
      </button>
    );
  }

  if (status === "pending_sent") {
    return (
      <button
        onClick={cancelRequest}
        disabled={loading}
        className={`${btnBase} border border-border hover:border-primary`}
      >
        {loading ? "..." : "Forespørsel sendt — avbryt"}
      </button>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="flex gap-2">
        <button
          onClick={acceptRequest}
          disabled={loading}
          className={`${btnBase} bg-primary text-white hover:bg-primary-dark`}
        >
          {loading ? "..." : "Godta"}
        </button>
        <button
          onClick={declineRequest}
          disabled={loading}
          className={`${btnBase} border border-border hover:border-primary`}
        >
          Avslå
        </button>
      </div>
    );
  }

  // accepted
  return (
    <button
      onClick={unfriend}
      disabled={loading}
      className={`${btnBase} border border-border hover:border-primary`}
    >
      {loading ? "..." : "Venner ✓"}
    </button>
  );
}
