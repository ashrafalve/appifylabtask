"use client";

import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/ui/LikeButton";
import { Loader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { CommentCard } from "@/components/feed/CommentCard";
import { useComments } from "@/hooks/useComments";
import { getPostLikers } from "@/lib/api";
import { displayName, resolveAssetUrl, timeAgo } from "@/lib/utils/format";
import type { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
  currentUserId?: string | null;
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => Promise<void> | void;
  onCommentCountChange: (id: string, delta: number) => void;
}

/**
 * A single feed post: header + dropdown, body, image, reaction summary,
 * the Like / Comment / Share action row, and the comments thread.
 */
export function PostCard({
  post,
  currentUserId,
  onToggleLike,
  onDelete,
  onCommentCountChange,
}: PostCardProps) {
  const isOwner = post.authorId === currentUserId;
  const { comments, loading, submitting, addComment, toggleLike, removeComment, error } = useComments(
    post.id,
    useCallback((delta: number) => onCommentCountChange(post.id, delta), [onCommentCountChange, post.id]),
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likersOpen, setLikersOpen] = useState(false);
  const [likers, setLikers] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [likersLoading, setLikersLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openLikers = async () => {
    setLikersOpen(true);
    setLikersLoading(true);
    try {
      // PLACEHOLDER: backend does not yet expose "people who liked".
      const data = await getPostLikers(post.id);
      setLikers(data);
    } finally {
      setLikersLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await onDelete(post.id);
    } finally {
      setDeleting(false);
    }
  };

  const openComments = () => {
    setCommentsOpen(true);
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        {/* Header */}
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <Avatar alt={displayName(post.author)} className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{displayName(post.author)}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} .{" "}
                <a href="#0">
                  {post.visibility === "PUBLIC" ? "Public" : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Private
                    </span>
                  )}
                </a>
              </p>
            </div>
          </div>

          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                type="button"
                className="_feed_timeline_post_dropdown_link"
                aria-label="Post options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <svg width="4" height="17" viewBox="0 0 4 17" fill="none" aria-hidden="true">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
            {menuOpen && (
              <div className="_feed_timeline_dropdown _timeline_dropdown show">
                  <ul className="_feed_timeline_dropdown_list">
                    <li className="_feed_timeline_dropdown_item">
                      <span className="_feed_timeline_dropdown_link">
                        <span>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 0 1 1.5-1.5h7.5a1.5 1.5 0 0 1 1.5 1.5v12z" />
                          </svg>
                        </span>
                        Save Post
                      </span>
                    </li>
                    <li className="_feed_timeline_dropdown_item">
                      <span className="_feed_timeline_dropdown_link">
                        <span>
                          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
                            <path fill="#377DFF" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 0 1 1.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 0 1 .057-1.083.774.774 0 0 1 1.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                          </svg>
                        </span>
                        Turn On Notification
                      </span>
                    </li>
                    {isOwner && (
                      <li className="_feed_timeline_dropdown_item">
                        <span className="_feed_timeline_dropdown_link">
                          <span>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                              <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.25 3H3a1.5 1.5 0 0 0-1.5 1.5V15A1.5 1.5 0 0 0 3 16.5h10.5A1.5 1.5 0 0 0 15 15V9.75" />
                              <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13.875 1.875a1.591 1.591 0 1 1 2.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z" />
                            </svg>
                          </span>
                          Edit Post
                        </span>
                      </li>
                    )}
                    {isOwner && (
                      <li className="_feed_timeline_dropdown_item">
                        <button
                          type="button"
                          className="_feed_timeline_dropdown_link _danger_link"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          <span>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                              <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 12 3v1.5m2.25 0V15a1.5 1.5 0 0 1-1.5 1.5h-7.5a1.5 1.5 0 0 1-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5" />
                            </svg>
                          </span>
                          Delete Post
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>

        {/* Body */}
        <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
        {post.image && (
          <div className="_feed_inner_timeline_image">
            {(() => {
              const src = resolveAssetUrl(post.image);
              if (typeof window !== "undefined") {
                console.log("[PostCard] post.id=", post.id, "post.image=", post.image, "resolved src=", src);
              }
              return src;
            })() && (
              <img src={resolveAssetUrl(post.image)} alt="Post attachment" className="_time_img" />
            )}
          </div>
        )}

        {/* Reaction summary */}
        <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
          <div className="_feed_inner_timeline_total_reacts_image">
            <span className="_buddy_react _buddy_react_1" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19z" />
                <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
              </svg>
            </span>
            {post.likeCount > 0 && (
              <button type="button" className="_buddy_react_count" onClick={openLikers}>
                {post.likeCount}
              </button>
            )}
          </div>
          <div className="_feed_inner_timeline_total_reacts_txt">
            <p className="_feed_inner_timeline_total_reacts_para1">
              <button type="button" className="_buddy_link_btn" onClick={openLikers}>
                <span>{post.likeCount}</span> Like
              </button>
            </p>
            <p className="_feed_inner_timeline_total_reacts_para2">
              <span>{post.commentCount}</span> Comment
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="_feed_inner_timeline_reaction">
          <LikeButton
            className="_feed_inner_timeline_reaction_emoji _feed_reaction"
            liked={post.likedByMe}
            count={post.likeCount}
            onToggle={() => onToggleLike(post.id)}
            label="Like"
          />
          <button
            type="button"
            className="_feed_inner_timeline_reaction_comment _feed_reaction"
            onClick={openComments}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                <svg className="_reaction_svg" width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                  <path stroke="currentColor" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 0 1 9.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 0 1 8.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 0 1-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 0 1-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
                </svg>
              </span>
              Comment
            </span>
          </button>
          <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction">
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                <svg className="_reaction_svg" width="24" height="21" viewBox="0 0 24 21" fill="none" aria-hidden="true">
                  <path stroke="currentColor" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
                </svg>
              </span>
              Share
            </span>
          </button>
        </div>

        {/* Comments */}
        {commentsOpen && (
          <div className="_feed_inner_timeline_cooment_area">
            <div className="_feed_inner_comment_box_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', margin: 0 }}>Comments</h4>
              <button
                type="button"
                onClick={() => setCommentsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="_feed_inner_comment_box">
              <form
                className="_feed_inner_comment_box_form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const value = commentText.trim();
                  if (!value) return;
                  await addComment(value);
                  setCommentText("");
                }}
              >
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <Avatar alt="" className="_comment_img" />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Voice comment">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path fill="#000" fillOpacity="0.46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 0 1 .5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 0 1-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 0 1 1 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 0 1 .5-.5zM7.833.667a3.218 3.218 0 0 1 3.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 0 1-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 0 0-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 0 0 2.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button type="button" className="_feed_inner_comment_box_icon_btn" aria-label="Attach image">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path fill="#000" fillOpacity="0.46" fillRule="evenodd" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {commentText.trim() && (
                    <button
                      type="submit"
                      className="_feed_inner_comment_box_icon_btn _comment_send_btn"
                      aria-label="Send comment"
                      disabled={submitting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M22 2 11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2 15 22 11 13 2 9 22 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="_timline_comment_main">
              {(() => {
                console.log("[PostCard] Rendering comments section - loading:", loading, "comments.length:", comments.length, "comments:", comments, "error:", error);
                return null;
              })()}
              {loading ? (
                <Loader label="Loading comments..." />
              ) : error ? (
                <p className="_text_center" style={{ color: '#ff4d4f', fontSize: '14px' }}>Error loading comments: {error}</p>
              ) : comments.length === 0 ? (
                <p className="_text_center" style={{ color: '#999', fontSize: '14px' }}>No comments yet. Be the first to comment!</p>
              ) : (
                <>
                  {comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUserId={currentUserId}
                      onToggleLike={toggleLike}
                      onDelete={removeComment}
                      onReplyCountChange={() => undefined}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* People who liked (placeholder data) */}
      <Modal open={likersOpen} onClose={() => setLikersOpen(false)} title="People who liked">
        {likersLoading ? (
          <Loader label="Loading..." />
        ) : likers.length === 0 ? (
          <p className="_buddy_empty">No one has liked this yet.</p>
        ) : (
          <ul className="_buddy_likers">
            {likers.map((u) => (
              <li key={u.id} className="_buddy_likers_item">
                <Avatar alt={`${u.firstName} ${u.lastName}`} className="_comment_img1" />
                <span>{`${u.firstName} ${u.lastName}`}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
