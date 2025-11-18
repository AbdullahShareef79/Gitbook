-- Create ItemType enum
CREATE TYPE "ItemType" AS ENUM ('TEMPLATE', 'SNIPPET', 'CONSULTING', 'COURSE');

-- Create MarketplaceItem table
CREATE TABLE "MarketplaceItem" (
    id TEXT PRIMARY KEY,
    "sellerId" TEXT NOT NULL REFERENCES "User"(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type "ItemType" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    tags TEXT[],
    "previewUrl" TEXT,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update Transaction table to reference MarketplaceItem
ALTER TABLE "Transaction" 
ADD COLUMN item_id TEXT REFERENCES "MarketplaceItem"(id);
