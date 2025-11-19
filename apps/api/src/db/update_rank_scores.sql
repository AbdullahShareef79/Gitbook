-- Script to update Post rank_score
-- Run this hourly via cron or similar scheduler
-- Formula: 0.6 * recency_score + 0.4 * engagement_score

UPDATE "Post" SET rank_score = (
  -- Recency score: normalized by hours since creation (newer = higher score)
  0.6 * (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 3600.0)) +
  
  -- Engagement score: normalized by interaction count
  0.4 * (
    (SELECT COUNT(*) FROM "PostInteraction" WHERE "postId" = "Post".id)::float / 
    GREATEST((SELECT MAX(interaction_count) FROM (
      SELECT COUNT(*) as interaction_count 
      FROM "PostInteraction" 
      GROUP BY "postId"
    ) subq), 1.0)
  )
);

-- Example: Run this script hourly
-- crontab -e
-- 0 * * * * psql -U dev -d devsocial -f /path/to/update_rank_scores.sql
