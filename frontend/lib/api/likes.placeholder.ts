import type { Liker } from "@/lib/types";

/**
 * PLACEHOLDER SERVICE — NOT YET BACKED BY AN ENDPOINT.
 *
 * The product requires a "People who liked" modal (see PostCard / LikeButton),
 * but the current backend does not expose an endpoint that lists the users who
 * liked a post/comment/reply. Rather than guess an API contract, we mark this
 * clearly and degrade gracefully:
 *
 *  - It resolves to an empty list so the modal can render an empty state.
 *  - When the backend ships `/posts/:id/likes` (or similar), replace the body
 *    with a real `api.get<Liker[]>(...)` call. The `Liker` type and the
 *    consuming UI already match that shape.
 *
 * DO NOT treat the empty result as an error.
 */
export async function getPostLikers(_postId: string): Promise<Liker[]> {
  // TODO(backend): GET /posts/:id/likes -> Liker[]
  return [];
}
