-- CreateTable
CREATE TABLE "Metadata" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 0,
    "hashes" TEXT[],
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "machine_id" INTEGER NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);
