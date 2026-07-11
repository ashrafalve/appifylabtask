"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postService } from "@/lib/api";
import type { Post, Visibility } from "@/lib/types";

const PAGE_LIMIT = 10;

/**
 * Feed post list with an "infinite-loading ready" architecture.
 *
 *  - Newest posts first (backend already orders by createdAt desc).
 *  - `loadMore` appends the next page; `hasMore` is derived from the
 *    last page being full, so a scroll/IntersectionObserver trigger can call it.
 *  - Like/unlike + create/delete are applied optimistically and reconciled
 *    with the server response (reverted on failure).
 */
export function useFeedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref so async callbacks read fresh state without re-creating them.
  const postsRef = useRef<Post[]>([]);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.list(1, PAGE_LIMIT);
      setPosts(data);
      setPage(1);
      setHasMore(data.length === PAGE_LIMIT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await postService.list(next, PAGE_LIMIT);
      setPosts((prev) => [...prev, ...data]);
      setPage(next);
      setHasMore(data.length === PAGE_LIMIT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  const createPost = useCallback(
    async (content: string, visibility: Visibility, image: File | null) => {
      const created = await postService.create({ content, visibility, image });
      setPosts((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const toggleLike = useCallback(async (postId: string) => {
    const current = postsRef.current.find((p) => p.id === postId);
    if (!current) return;
    const willLike = !current.likedByMe;

    // Optimistic update.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: willLike,
              likeCount: p.likeCount + (willLike ? 1 : -1),
            }
          : p,
      ),
    );

    try {
      const res = willLike
        ? await postService.like(postId)
        : await postService.unlike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: res.liked, likeCount: res.likeCount }
            : p,
        ),
      );
    } catch {
      // Revert.
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !willLike,
                likeCount: p.likeCount + (willLike ? -1 : 1),
              }
            : p,
        ),
      );
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await postService.remove(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete post");
    }
  }, []);

  const bumpCommentCount = useCallback((postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
          : p,
      ),
    );
  }, []);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadInitial();
  }, [loadInitial]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    createPost,
    toggleLike,
    deletePost,
    bumpCommentCount,
  };
}
