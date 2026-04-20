-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Light" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" INTEGER NOT NULL,
    "intensity" REAL NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "positionZ" REAL NOT NULL,
    "targetPositionX" REAL NOT NULL,
    "targetPositionY" REAL NOT NULL,
    "targetPositionZ" REAL NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Light_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
