"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/ui/LikeButton";
import { Loader } from "@/components/ui/Loader";
import { ReplyCard } from "@/components/feed/ReplyCard";
import { useReplies } from "@/hooks/useReplies";
import { displayName, timeAgo } from "@/lib/utils/format";
import type { Comment } from "@/lib/types";

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string | null;
  onToggleLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onReplyCountChange: (delta: number) => void;
}

/** A comment plus its nested replies and reply composer. */
export function CommentCard({
  comment,
  currentUserId,
  onToggleLike,
  onDelete,
  onReplyCountChange,
}: CommentCardProps) {
  const isOwner = comment.authorId === currentUserId;
  const { replies, loading, submitting, addReply, toggleLike, removeReply } = useReplies(
    comment.id,
    onReplyCountChange,
  );
  const [replyText, setReplyText] = useState("");
  const [open, setOpen] = useState(true);

  const submitReply = async () => {
    const text = replyText.trim();
    if (!text) return;
    await addReply(text);
    setReplyText("");
  };

  return (
    <div className="_comment_main">
      <div className="_comment_image">
        <a href="#0" className="_comment_image_link">
          <Avatar alt={displayName(comment.author)} className="_comment_img1" />
        </a>
      </div>
      <div className="_comment_area">
        {/* Bubble */}
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <a href="#0">
                <h4 className="_comment_name_title">{displayName(comment.author)}</h4>
              </a>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.content}</span>
            </p>
          </div>
        </div>

        {/* Action row — OUTSIDE the bubble, in normal flow */}
        <div className="_comment_reply _comment_reply_num">
          <ul className="_comment_reply_list">
            <li>
              <LikeButton
                size="sm"
                liked={comment.likedByMe}
                count={comment.likeCount}
                onToggle={() => onToggleLike(comment.id)}
              />
            </li>
            <li>
              <button type="button" className="_time_link" onClick={() => setOpen((o) => !o)}>
                {open ? "Hide" : "Reply"}
              </button>
            </li>
            <li>
              <span className="_time_link">{timeAgo(comment.createdAt)}</span>
            </li>
            {isOwner && onDelete && (
              <li>
                <button
                  type="button"
                  className="_time_link _danger_link"
                  onClick={() => onDelete(comment.id)}
                >
                  Delete
                </button>
              </li>
            )}
          </ul>
        </div>

        {open && (
          <div className="_comment_replies">
            {loading ? (
              <Loader label="Loading replies..." />
            ) : (
              replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onToggleLike={toggleLike}
                  onDelete={removeReply}
                />
              ))
            )}

            <div className="_feed_inner_comment_box">
              <form
                className="_feed_inner_comment_box_form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitReply();
                }}
              >
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <Avatar alt="" className="_comment_img" />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  {replyText.trim() && (
                    <button
                      type="submit"
                      className="_feed_inner_comment_box_icon_btn _comment_send_btn"
                      aria-label="Send reply"
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
          </div>
        )}
      </div>
    </div>
  );
}
