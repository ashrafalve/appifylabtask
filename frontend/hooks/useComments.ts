"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { commentService } from "@/lib/api";
import type { Comment } from "@/lib/types";

const PAGE_LIMIT = 20;

/**
 * Comments for a single post.
 * `onCountChange` lets the parent PostCard keep its `commentCount` in sync.
 */
export function useComments(
  postId: string,
  onCountChange?: (delta: number) => void,
) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const commentsRef = useRef<Comment[]>([]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[useComments] Loading comments for postId:", postId);
      const data = await commentService.list(postId, 1, PAGE_LIMIT);
      console.log("[useComments] Loaded comments:", data);
      setComments(data);
    } catch (err) {
      console.error("[useComments] Error loading comments:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load comments";
      setError(errorMessage);
      // Don't set comments to empty array on error, keep existing comments if any
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Load comments on mount and when postId changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const addComment = useCallback(
    async (content: string) => {
      setSubmitting(true);
      try {
        const created = await commentService.create({ postId, content });
        setComments((prev) => [...prev, created]);
        onCountChange?.(1);
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [postId, onCountChange],
  );

  const toggleLike = useCallback(async (commentId: string) => {
    const current = commentsRef.current.find((c) => c.id === commentId);
    if (!current) return;
    const willLike = !current.likedByMe;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likedByMe: willLike, likeCount: c.likeCount + (willLike ? 1 : -1) }
          : c,
      ),
    );
    try {
      const res = willLike
        ? await commentService.like(commentId)
        : await commentService.unlike(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likedByMe: res.liked, likeCount: res.likeCount } : c,
        ),
      );
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likedByMe: !willLike, likeCount: c.likeCount + (willLike ? -1 : 1) }
            : c,
        ),
      );
    }
  }, []);

  const removeComment = useCallback(
    async (commentId: string) => {
      await commentService.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCountChange?.(-1);
    },
    [onCountChange],
  );

  return { comments, loading, submitting, error, load, addComment, toggleLike, removeComment };
}
