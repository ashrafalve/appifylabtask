"use client";

import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/ui/LikeButton";
import { displayName, timeAgo } from "@/lib/utils/format";
import type { Reply } from "@/lib/types";

interface ReplyCardProps {
  reply: Reply;
  currentUserId?: string | null;
  onToggleLike: (id: string) => void;
  onDelete?: (id: string) => void;
}

/** A single reply to a comment. */
export function ReplyCard({ reply, currentUserId, onToggleLike, onDelete }: ReplyCardProps) {
  const isOwner = reply.authorId === currentUserId;

  return (
    <div className="_comment_main">
      <div className="_comment_image">
        <a href="#0" className="_comment_image_link">
          <Avatar alt={displayName(reply.author)} className="_comment_img1" />
        </a>
      </div>
      <div className="_comment_area">
        {/* Bubble */}
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <a href="#0">
                <h4 className="_comment_name_title">{displayName(reply.author)}</h4>
              </a>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{reply.content}</span>
            </p>
          </div>
        </div>

        {/* Action row — outside the bubble */}
        <div className="_comment_reply _comment_reply_num">
          <ul className="_comment_reply_list">
            <li>
              <LikeButton
                size="sm"
                liked={reply.likedByMe}
                count={reply.likeCount}
                onToggle={() => onToggleLike(reply.id)}
              />
            </li>
            <li>
              <span className="_time_link">{timeAgo(reply.createdAt)}</span>
            </li>
            {isOwner && onDelete && (
              <li>
                <button type="button" className="_time_link _danger_link" onClick={() => onDelete(reply.id)}>
                  Delete
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
