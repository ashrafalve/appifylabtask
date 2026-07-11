"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { FeedComposer } from "@/components/feed/FeedComposer";
import { PostCard } from "@/components/feed/PostCard";
import { Loader } from "@/components/ui/Loader";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import type { Visibility } from "@/lib/types";

/** Static "stories" strip from the source feed markup (decorative). */
function StoriesRow() {
  const people = [
    { name: "Your Story", img: "card_ppl1.png", self: true },
    { name: "Ryan Roslansky", img: "card_ppl2.png", self: false },
    { name: "Ryan Roslansky", img: "card_ppl3.png", self: false },
    { name: "Ryan Roslansky", img: "card_ppl4.png", self: false },
  ];
  return (
    <div className="_feed_inner_ppl_card _mar_b16">
      <div className="_feed_inner_story_arrow">
        <button type="button" className="_feed_inner_story_arrow_btn" aria-label="Scroll stories">
          <svg width="9" height="8" viewBox="0 0 9 8" fill="none" aria-hidden="true">
            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 0 1 0-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
          </svg>
        </button>
      </div>
      <div className="row">
        {people.map((p, i) => (
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col" key={i}>
            <div className={p.self ? "_feed_inner_profile_story _b_radious6" : "_feed_inner_public_story _b_radious6"}>
              <div className={p.self ? "_feed_inner_profile_story_image" : "_feed_inner_public_story_image"}>
                <img src={`/assets/images/${p.img}`} alt={p.name} className={p.self ? "_profile_story_img" : "_public_story_img"} />
                {p.self ? (
                  <div className="_feed_inner_story_txt">
                    <div className="_feed_inner_story_btn">
                      <button className="_feed_inner_story_btn_link" type="button" aria-label="Add to your story">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                        </svg>
                      </button>
                    </div>
                    <p className="_feed_inner_story_para">Your Story</p>
                  </div>
                ) : (
                  <>
                    <div className="_feed_inner_pulic_story_txt">
                      <p className="_feed_inner_pulic_story_para">{p.name}</p>
                    </div>
                    <div className="_feed_inner_public_mini">
                      <img src="/assets/images/mini_pic.png" alt="" className="_public_mini_img" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const { posts, loading, loadingMore, hasMore, error, loadMore, createPost, toggleLike, deletePost, bumpCommentCount } =
    useFeedPosts();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite-scroll trigger.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleCreate = async (content: string, visibility: Visibility, image: File | null) => {
    await createPost(content, visibility, image);
  };

  return (
    <ProtectedLayout>
      <FeedLayout>
        <StoriesRow />

        <FeedComposer onSubmit={handleCreate} />

        {loading ? (
          <Loader label="Loading your feed..." />
        ) : error ? (
          <div className="_social_login_form_error" role="alert">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="_feed_empty">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.filter(Boolean).map((post, index) => (
              <PostCard
                key={post?.id ?? index}
                post={post}
                currentUserId={user?.id ?? null}
                onToggleLike={toggleLike}
                onDelete={deletePost}
                onCommentCountChange={bumpCommentCount}
              />
            ))}
            <div ref={sentinelRef} aria-hidden="true" />
            {loadingMore && <Loader label="Loading more..." />}
            {!hasMore && <div className="_feed_end">You&rsquo;re all caught up.</div>}
          </>
        )}
      </FeedLayout>
    </ProtectedLayout>
  );
}
