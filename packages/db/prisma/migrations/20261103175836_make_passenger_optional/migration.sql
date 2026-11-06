-- DropForeignKey
ALTER TABLE "OrderPassenger" DROP CONSTRAINT "OrderPassenger_passengerId_fkey";

-- AlterTable
ALTER TABLE "OrderPassenger" ALTER COLUMN "passengerId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OrderPassenger_passengerId_idx" ON "OrderPassenger"("passengerId");

-- AddForeignKey
ALTER TABLE "OrderPassenger" ADD CONSTRAINT "OrderPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;
