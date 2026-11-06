/*
  Warnings:

  - You are about to drop the column `googleMapCoords` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `priceBeforeTaxes` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `Hotel` table. All the data in the column will be lost.
  - Added the required column `passengerId` to the `OrderPassenger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "googleMapCoords",
DROP COLUMN "priceBeforeTaxes",
DROP COLUMN "totalPrice";

-- AlterTable
ALTER TABLE "OrderPassenger" ADD COLUMN     "passengerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "passportNumber" TEXT,
    "birthDate" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_nationalId_key" ON "Passenger"("nationalId");

-- CreateIndex
CREATE INDEX "Passenger_userId_idx" ON "Passenger"("userId");

-- AddForeignKey
ALTER TABLE "OrderPassenger" ADD CONSTRAINT "OrderPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
