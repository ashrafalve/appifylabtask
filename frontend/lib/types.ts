/**
 * Shared domain types for the Buddy Script frontend.
 *
 * These mirror the response DTOs returned by the NestJS backend
 * (see backend/src/modules/*). The backend wraps every response in the
 * envelope { success, statusCode, message, data, timestamp, path },
 * but our axios client (lib/api/client.ts) unwraps `data` for us, so the
 * types below describe the *payload*, not the envelope.
 */

export type Visibility = "PUBLIC" | "PRIVATE";

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResult {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/** A minimal author reference as embedded in posts/comments/replies. */
export interface Author {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  image: string | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  author: Author | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: Author | null;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
}

export interface Reply {
  id: string;
  commentId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: Author | null;
  likeCount: number;
  likedByMe: boolean;
}

/** Optimistic like/unlike confirmation returned by every like endpoint. */
export interface LikeResult {
  liked: boolean;
  likeCount: number;
}

/** Placeholder shape for the (currently not implemented) "people who liked" API. */
export interface Liker {
  id: string;
  firstName: string;
  lastName: string;
}

/**
 * Standard envelope returned by the backend for the rare cases where we read
 * the raw envelope (e.g. error normalization). Usually ignored thanks to the
 * response interceptor.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}
