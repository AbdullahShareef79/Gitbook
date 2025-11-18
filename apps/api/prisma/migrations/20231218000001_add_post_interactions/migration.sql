-- CreateEnum
CREATE TYPE "InteractionKind" AS ENUM ('LIKE', 'BOOKMARK', 'COMMENT');

-- CreateTable
CREATE TABLE "PostInteraction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "InteractionKind" NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostInteraction_postId_idx" ON "PostInteraction"("postId");

-- CreateIndex
CREATE INDEX "PostInteraction_userId_idx" ON "PostInteraction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostInteraction_postId_userId_kind_key" ON "PostInteraction"("postId", "userId", "kind");

-- AddForeignKey
ALTER TABLE "PostInteraction" ADD CONSTRAINT "PostInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostInteraction" ADD CONSTRAINT "PostInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
