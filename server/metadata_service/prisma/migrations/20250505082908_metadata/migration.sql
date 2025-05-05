-- CreateTable
CREATE TABLE "Metadata" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 0,
    "hashes" TEXT[],

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);
