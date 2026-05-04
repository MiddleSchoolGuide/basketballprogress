-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "positionFocus" TEXT NOT NULL DEFAULT '3/4/5',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "leftHandControl" DOUBLE PRECISION NOT NULL,
    "rightHandControl" DOUBLE PRECISION NOT NULL,
    "formShooting" DOUBLE PRECISION NOT NULL,
    "guideHand" DOUBLE PRECISION NOT NULL,
    "freeThrowsMade" INTEGER NOT NULL,
    "freeThrowsAttempted" INTEGER NOT NULL,
    "spotShootingMade" INTEGER NOT NULL,
    "spotShootingAttempted" INTEGER NOT NULL,
    "closeRangeMade" INTEGER NOT NULL,
    "closeRangeAttempted" INTEGER NOT NULL,
    "stopPopSpeed" DOUBLE PRECISION NOT NULL,
    "footwork" DOUBLE PRECISION NOT NULL,
    "bigPlayerSkill" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "coachNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "metricName" TEXT NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillChecklistItem" (
    "id" SERIAL NOT NULL,
    "drillName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetReps" TEXT,
    "description" TEXT,

    CONSTRAINT "DrillChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionDrillCompletion" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER,
    "drillId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionDrillCompletion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDrillCompletion" ADD CONSTRAINT "SessionDrillCompletion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDrillCompletion" ADD CONSTRAINT "SessionDrillCompletion_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "DrillChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
