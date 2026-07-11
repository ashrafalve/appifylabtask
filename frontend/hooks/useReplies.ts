"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { replyService } from "@/lib/api";
import type { Reply } from "@/lib/types";

const PAGE_LIMIT = 20;

/** Replies for a single comment. `onCountChange` syncs the parent comment. */
export function useReplies(
  commentId: string,
  onCountChange?: (delta: number) => void,
) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const repliesRef = useRef<Reply[]>([]);

  useEffect(() => {
    repliesRef.current = replies;
  }, [replies]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await replyService.list(commentId, 1, PAGE_LIMIT);
      setReplies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load replies");
    } finally {
      setLoading(false);
    }
  }, [commentId]);

  useEffect(() => {
    load();
  }, [load]);

  const addReply = useCallback(
    async (content: string) => {
      setSubmitting(true);
      try {
        const created = await replyService.create({ commentId, content });
        setReplies((prev) => [...prev, created]);
        onCountChange?.(1);
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [commentId, onCountChange],
  );

  const toggleLike = useCallback(async (replyId: string) => {
    const current = repliesRef.current.find((r) => r.id === replyId);
    if (!current) return;
    const willLike = !current.likedByMe;
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, likedByMe: willLike, likeCount: r.likeCount + (willLike ? 1 : -1) }
          : r,
      ),
    );
    try {
      const res = willLike
        ? await replyService.like(replyId)
        : await replyService.unlike(replyId);
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId ? { ...r, likedByMe: res.liked, likeCount: res.likeCount } : r,
        ),
      );
    } catch {
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? { ...r, likedByMe: !willLike, likeCount: r.likeCount + (willLike ? -1 : 1) }
            : r,
        ),
      );
    }
  }, []);

  const removeReply = useCallback(
    async (replyId: string) => {
      await replyService.remove(replyId);
      setReplies((prev) => {
        const target = prev.find((r) => r.id === replyId);
        const delta = target ? -1 : 0;
        if (delta) onCountChange?.(delta);
        return prev.filter((r) => r.id !== replyId);
      });
    },
    [onCountChange],
  );

  return { replies, loading, submitting, error, load, addReply, toggleLike, removeReply };
}
