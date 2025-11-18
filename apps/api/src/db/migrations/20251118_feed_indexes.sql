-- Feed pagination and ranking indexes
CREATE INDEX IF NOT EXISTS post_created_id_desc_idx ON "Post"("createdAt" DESC, id DESC);
CREATE INDEX IF NOT EXISTS post_interactions_post_kind_idx ON "PostInteraction"("postId", kind);
CREATE INDEX IF NOT EXISTS post_interactions_unique ON "PostInteraction"("userId", "postId", kind);
