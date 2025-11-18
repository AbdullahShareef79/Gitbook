-- CreateTable
CREATE TABLE "jam_snapshots" (
    "id" TEXT NOT NULL,
    "jam_id" TEXT NOT NULL,
    "state" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jam_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jam_snapshots_jam_id_idx" ON "jam_snapshots"("jam_id");

-- AddForeignKey
ALTER TABLE "jam_snapshots" ADD CONSTRAINT "jam_snapshots_jam_id_fkey" FOREIGN KEY ("jam_id") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
