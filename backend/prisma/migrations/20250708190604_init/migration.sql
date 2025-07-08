-- CreateEnum
CREATE TYPE "MealLocation" AS ENUM ('school', 'work', 'other');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationCompleted" BOOLEAN NOT NULL DEFAULT false,
    "company" TEXT,
    "instructor" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "workdays" INTEGER[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workday" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activities" TEXT NOT NULL,
    "learnings" TEXT NOT NULL,
    "mealLocation" "MealLocation" NOT NULL,
    "mealLocationOther" TEXT,
    "hours" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Workday_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Workday" ADD CONSTRAINT "Workday_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
