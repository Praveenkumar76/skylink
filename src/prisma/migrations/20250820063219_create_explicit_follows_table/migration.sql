/*
  Warnings:

  - You are about to drop the `_userFollows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_userFollows" DROP CONSTRAINT "_userFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_userFollows" DROP CONSTRAINT "_userFollows_B_fkey";

-- DropTable
DROP TABLE "_userFollows";

-- CreateTable
CREATE TABLE "Follows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
