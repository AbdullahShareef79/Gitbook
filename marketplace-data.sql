-- Insert mock marketplace items
INSERT INTO "MarketplaceItem" (id, "sellerId", title, description, type, "priceCents", tags, "previewUrl", "createdAt", "updatedAt") VALUES
('item1', 'user1', 'Next.js E-Commerce Template', 'Complete e-commerce solution with Stripe integration, product catalog, shopping cart, and checkout flow. Includes admin dashboard, inventory management, and order tracking.', 'TEMPLATE', 4999, ARRAY['nextjs', 'stripe', 'ecommerce', 'typescript'], 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400', NOW(), NOW()),

('item2', 'user2', 'React Custom Hooks Library', 'Collection of 25+ production-ready React hooks for common use cases: useDebounce, useLocalStorage, useIntersectionObserver, useMediaQuery, and more.', 'SNIPPET', 1999, ARRAY['react', 'hooks', 'typescript', 'library'], 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', NOW(), NOW()),

('item3', 'user3', 'TypeScript API Boilerplate', 'Enterprise-grade REST API starter with NestJS, PostgreSQL, authentication, rate limiting, logging, testing, and Docker setup. Production-ready architecture.', 'TEMPLATE', 2999, ARRAY['nestjs', 'typescript', 'postgresql', 'docker'], 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400', NOW(), NOW()),

('item4', 'user1', '1-Hour Code Review Session', 'Get expert feedback on your codebase. I will review architecture, code quality, performance, security, and best practices. Includes written report and 30-min video call.', 'CONSULTING', 15000, ARRAY['consulting', 'code-review', 'mentorship'], NULL, NOW(), NOW()),

('item5', 'user4', 'Modern UI Component Library', 'Beautiful, accessible React component library with 50+ components. Built with Tailwind CSS, Radix UI primitives, and full TypeScript support. Includes Storybook docs.', 'TEMPLATE', 5999, ARRAY['react', 'tailwind', 'components', 'ui'], 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', NOW(), NOW()),

('item6', 'user2', 'Advanced React Patterns Course', 'Master compound components, render props, HOCs, custom hooks, and state management. 8 hours of video content with 15 real-world projects and exercises.', 'COURSE', 9999, ARRAY['react', 'course', 'patterns', 'advanced'], 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400', NOW(), NOW()),

('item7', 'user3', 'GraphQL Query Optimizer', 'Automated tool to detect N+1 queries, optimize DataLoader usage, and analyze query complexity. Includes VS Code extension and CLI tool.', 'SNIPPET', 2999, ARRAY['graphql', 'optimization', 'performance', 'tools'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', NOW(), NOW()),

('item8', 'user4', 'Serverless Deploy Scripts', 'Production-ready deployment scripts for AWS Lambda, API Gateway, DynamoDB, and S3. Includes CI/CD pipeline templates for GitHub Actions and monitoring setup.', 'SNIPPET', 1499, ARRAY['aws', 'serverless', 'lambda', 'cicd'], 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', NOW(), NOW()),

('item9', 'user1', 'Full-Stack SaaS Starter Kit', 'Complete SaaS boilerplate with authentication, subscription billing, team management, admin panel, email templates, and documentation. Save months of development.', 'TEMPLATE', 7999, ARRAY['saas', 'stripe', 'nextjs', 'full-stack'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', NOW(), NOW()),

('item10', 'user2', 'Microservices Architecture Guide', 'Comprehensive course on building scalable microservices with Node.js, Docker, Kubernetes, RabbitMQ, and monitoring. Includes 3 production case studies.', 'COURSE', 12999, ARRAY['microservices', 'kubernetes', 'docker', 'architecture'], 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400', NOW(), NOW());
