-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT DEFAULT 'user',
ADD COLUMN     "status" TEXT DEFAULT 'active';
