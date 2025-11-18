-- Create mock users
INSERT INTO "User" (id, handle, email, name, image, "githubId", "createdAt", "updatedAt")
VALUES 
  ('user1', 'sarahdev', 'sarah@example.com', 'Sarah Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'gh123', NOW(), NOW()),
  ('user2', 'mikecodes', 'mike@example.com', 'Mike Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 'gh456', NOW(), NOW()),
  ('user3', 'alexbuilds', 'alex@example.com', 'Alex Rivera', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'gh789', NOW(), NOW()),
  ('user4', 'emmatech', 'emma@example.com', 'Emma Wu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 'gh101', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create mock projects
INSERT INTO "Project" (id, title, summary, "githubUrl", tags, "ownerId", "createdAt", "updatedAt")
VALUES 
  ('proj1', 'AI Code Assistant', 'An intelligent code completion tool powered by GPT-4. Helps developers write better code faster.', 'https://github.com/sarahdev/ai-assistant', ARRAY['ai', 'typescript', 'vscode'], 'user1', NOW(), NOW()),
  ('proj2', 'React Flow Builder', 'Visual workflow builder for React apps with real-time collaboration and 100+ pre-built components.', 'https://github.com/mikecodes/react-flow', ARRAY['react', 'ui', 'workflow'], 'user2', NOW(), NOW()),
  ('proj3', 'TypeScript Boilerplate', 'Production-ready TypeScript starter with Next.js 14, Prisma, tRPC, and Tailwind.', 'https://github.com/alexbuilds/ts-starter', ARRAY['typescript', 'nextjs', 'boilerplate'], 'user3', NOW(), NOW()),
  ('proj4', 'Real-Time Chat SDK', 'Drop-in WebSocket chat solution with typing indicators, read receipts, and end-to-end encryption.', 'https://github.com/emmatech/chat-sdk', ARRAY['websocket', 'chat', 'realtime'], 'user4', NOW(), NOW()),
  ('proj5', 'DevOps Automation', 'Infrastructure as code toolkit for AWS/Azure/GCP. Deploy full-stack apps with one command.', 'https://github.com/sarahdev/devops-tools', ARRAY['devops', 'iac', 'aws'], 'user1', NOW(), NOW()),
  ('proj6', 'Vue Dashboard Kit', 'Beautiful admin dashboard with 50+ charts, tables, and widgets. Dark mode, responsive.', 'https://github.com/mikecodes/vue-dash', ARRAY['vue', 'dashboard', 'ui'], 'user2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create mock posts (repo cards)
INSERT INTO "Post" (id, type, content, "authorId", "createdAt", "updatedAt")
VALUES 
  ('post1', 'REPO_CARD', '{"projectId": "proj1", "caption": "Just shipped v2.0! 🚀 Multi-language support and 3x faster completions."}', 'user1', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('post2', 'REPO_CARD', '{"projectId": "proj2", "caption": "Built over the weekend. Handles complex state machines with ease!"}', 'user2', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  ('post3', 'REPO_CARD', '{"projectId": "proj3", "caption": "After using 10+ boilerplates, I made my own. Everything in one place!"}', 'user3', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('post4', 'REPO_CARD', '{"projectId": "proj4", "caption": "Hit 3K stars! 🎉 Working on voice/video calls next."}', 'user4', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('post5', 'REPO_CARD', '{"projectId": "proj5", "caption": "Deploy your full-stack app in 60 seconds. No YAML hell! 👇"}', 'user1', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
  ('post6', 'REPO_CARD', '{"projectId": "proj6", "caption": "50+ components. Perfect for SaaS apps. MIT licensed! ⭐"}', 'user2', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- Create mock interactions (likes, bookmarks, comments)
INSERT INTO "PostInteraction" (id, "postId", "userId", kind, content, "createdAt")
VALUES 
  -- Likes for post1
  ('int1', 'post1', 'user2', 'LIKE', NULL, NOW() - INTERVAL '1 hour'),
  ('int2', 'post1', 'user3', 'LIKE', NULL, NOW() - INTERVAL '90 minutes'),
  ('int3', 'post1', 'user4', 'LIKE', NULL, NOW() - INTERVAL '2 hours'),
  
  -- Comments for post1
  ('int4', 'post1', 'user2', 'COMMENT', 'This is amazing! Just integrated it into our codebase. The completions are so accurate 🔥', NOW() - INTERVAL '1 hour'),
  ('int5', 'post1', 'user3', 'COMMENT', 'How does it compare to GitHub Copilot? Curious about the performance improvements.', NOW() - INTERVAL '90 minutes'),
  
  -- Bookmark for post1
  ('int6', 'post1', 'user4', 'BOOKMARK', NULL, NOW() - INTERVAL '2 hours'),
  
  -- Likes for post2
  ('int7', 'post2', 'user1', 'LIKE', NULL, NOW() - INTERVAL '4 hours'),
  ('int8', 'post2', 'user3', 'LIKE', NULL, NOW() - INTERVAL '5 hours'),
  
  -- Comments for post2
  ('int9', 'post2', 'user1', 'COMMENT', 'The drag-and-drop is super smooth! Are you planning to add conditional branches?', NOW() - INTERVAL '4 hours'),
  ('int10', 'post2', 'user4', 'COMMENT', 'Love the real-time collab feature. This could replace our current solution.', NOW() - INTERVAL '4 hours'),
  ('int11', 'post2', 'user3', 'COMMENT', 'Incredible work for a weekend project! The UI is clean and intuitive.', NOW() - INTERVAL '5 hours'),
  
  -- Likes for post3
  ('int12', 'post3', 'user1', 'LIKE', NULL, NOW() - INTERVAL '20 hours'),
  ('int13', 'post3', 'user2', 'LIKE', NULL, NOW() - INTERVAL '22 hours'),
  ('int14', 'post3', 'user4', 'LIKE', NULL, NOW() - INTERVAL '1 day'),
  
  -- Comments for post3
  ('int15', 'post3', 'user1', 'COMMENT', 'Finally! A boilerplate that includes everything. The tRPC setup is perfect.', NOW() - INTERVAL '20 hours'),
  ('int16', 'post3', 'user2', 'COMMENT', 'Bookmarking this for my next project. Does it support Postgres and MySQL?', NOW() - INTERVAL '22 hours'),
  
  -- Bookmarks for post3
  ('int17', 'post3', 'user1', 'BOOKMARK', NULL, NOW() - INTERVAL '20 hours'),
  ('int18', 'post3', 'user4', 'BOOKMARK', NULL, NOW() - INTERVAL '1 day'),
  
  -- Likes for post4
  ('int19', 'post4', 'user1', 'LIKE', NULL, NOW() - INTERVAL '2 hours'),
  ('int20', 'post4', 'user2', 'LIKE', NULL, NOW() - INTERVAL '3 hours'),
  ('int21', 'post4', 'user3', 'LIKE', NULL, NOW() - INTERVAL '3 hours'),
  
  -- Comments for post4
  ('int22', 'post4', 'user2', 'COMMENT', 'Congrats on 3K! 🎉 Voice calls would be huge. Maybe add screen sharing too?', NOW() - INTERVAL '2 hours'),
  ('int23', 'post4', 'user3', 'COMMENT', 'Been using this in production for 6 months. Rock solid! Well deserved growth.', NOW() - INTERVAL '3 hours'),
  
  -- Likes for post5
  ('int24', 'post5', 'user2', 'LIKE', NULL, NOW() - INTERVAL '7 hours'),
  ('int25', 'post5', 'user3', 'LIKE', NULL, NOW() - INTERVAL '8 hours'),
  
  -- Comments for post5
  ('int26', 'post5', 'user2', 'COMMENT', 'YAML hell is real 😅 This looks like a game changer. Does it support Docker Compose?', NOW() - INTERVAL '7 hours'),
  
  -- Bookmark for post5
  ('int27', 'post5', 'user4', 'BOOKMARK', NULL, NOW() - INTERVAL '8 hours'),
  
  -- Likes for post6
  ('int28', 'post6', 'user1', 'LIKE', NULL, NOW() - INTERVAL '11 hours'),
  ('int29', 'post6', 'user3', 'LIKE', NULL, NOW() - INTERVAL '12 hours'),
  
  -- Comments for post6
  ('int30', 'post6', 'user1', 'COMMENT', 'The dark mode is beautiful! Using this for my SaaS dashboard. Thank you! 🙏', NOW() - INTERVAL '11 hours')
ON CONFLICT (id) DO NOTHING;

-- Create some follow relationships
INSERT INTO "Follow" (id, "followerId", "followeeId")
VALUES 
  ('follow1', 'user1', 'user2'),
  ('follow2', 'user1', 'user3'),
  ('follow3', 'user2', 'user1'),
  ('follow4', 'user2', 'user4'),
  ('follow5', 'user3', 'user1'),
  ('follow6', 'user3', 'user4'),
  ('follow7', 'user4', 'user2'),
  ('follow8', 'user4', 'user3')
ON CONFLICT (id) DO NOTHING;

-- Create a mock jam session
INSERT INTO "Jam" (id, "roomId", "hostId", "startedAt")
VALUES 
  ('jam1', 'demo-collab-room', 'user1', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;
