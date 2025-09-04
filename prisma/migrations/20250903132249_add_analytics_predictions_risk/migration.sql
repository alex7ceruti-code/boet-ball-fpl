-- CreateEnum
CREATE TYPE "public"."RiskCategory" AS ENUM ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "public"."RiskTolerance" AS ENUM ('CONSERVATIVE', 'BALANCED', 'AGGRESSIVE');

-- CreateTable
CREATE TABLE "public"."player_predictions" (
    "id" TEXT NOT NULL,
    "fplPlayerId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "predictedPoints" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "basePoints" DOUBLE PRECISION NOT NULL,
    "formAdjustment" DOUBLE PRECISION NOT NULL,
    "fixtureAdjustment" DOUBLE PRECISION NOT NULL,
    "teamFormAdjustment" DOUBLE PRECISION NOT NULL,
    "injuryRiskAdjustment" DOUBLE PRECISION NOT NULL,
    "rotationRiskAdjustment" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "predictionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualPoints" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,

    CONSTRAINT "player_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."player_gameweek_history" (
    "id" TEXT NOT NULL,
    "fplPlayerId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "cleanSheets" INTEGER NOT NULL,
    "goalsConceded" INTEGER NOT NULL,
    "saves" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL,
    "bps" INTEGER NOT NULL,
    "expectedGoals" DOUBLE PRECISION,
    "expectedAssists" DOUBLE PRECISION,
    "influence" DOUBLE PRECISION,
    "creativity" DOUBLE PRECISION,
    "threat" DOUBLE PRECISION,
    "wasHome" BOOLEAN NOT NULL,
    "opponentTeamId" INTEGER NOT NULL,
    "fixturedifficulty" INTEGER NOT NULL,
    "teamGoalsFor" INTEGER,
    "teamGoalsAgainst" INTEGER,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "played" BOOLEAN NOT NULL DEFAULT false,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_gameweek_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."player_risk_assessments" (
    "id" TEXT NOT NULL,
    "fplPlayerId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "rotationRisk" INTEGER NOT NULL,
    "injuryRisk" INTEGER NOT NULL,
    "priceChangeRisk" INTEGER NOT NULL,
    "formVolatility" INTEGER NOT NULL,
    "minutesConsistency" DOUBLE PRECISION NOT NULL,
    "injuryHistory" JSONB,
    "transferTrend" TEXT,
    "teamDepth" INTEGER,
    "overallRiskScore" INTEGER NOT NULL,
    "riskCategory" "public"."RiskCategory" NOT NULL,
    "conservativePickSuitability" INTEGER NOT NULL,
    "aggressivePickSuitability" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_analytics" (
    "id" TEXT NOT NULL,
    "fplTeamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "last5Games" JSONB NOT NULL,
    "goalsForPer90" DOUBLE PRECISION NOT NULL,
    "goalsAgainstPer90" DOUBLE PRECISION NOT NULL,
    "xGForPer90" DOUBLE PRECISION,
    "xGAgainstPer90" DOUBLE PRECISION,
    "attackStrength" INTEGER NOT NULL,
    "defenseStrength" INTEGER NOT NULL,
    "homeAdvantage" DOUBLE PRECISION NOT NULL,
    "upcomingFixtures" JSONB NOT NULL,
    "difficultyRating" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prediction_accuracy" (
    "id" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "totalPredictions" INTEGER NOT NULL,
    "meanAbsoluteError" DOUBLE PRECISION NOT NULL,
    "rootMeanSquaredError" DOUBLE PRECISION NOT NULL,
    "accuracyWithin1" DOUBLE PRECISION NOT NULL,
    "accuracyWithin2" DOUBLE PRECISION NOT NULL,
    "gkAccuracy" DOUBLE PRECISION,
    "defAccuracy" DOUBLE PRECISION,
    "midAccuracy" DOUBLE PRECISION,
    "fwdAccuracy" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_accuracy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_analytics_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskTolerance" "public"."RiskTolerance" NOT NULL DEFAULT 'BALANCED',
    "predictionHorizon" INTEGER NOT NULL DEFAULT 6,
    "minConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "maxPlayerPrice" DOUBLE PRECISION,
    "totalBudget" DOUBLE PRECISION,
    "favoritePositions" JSONB,
    "avoidHighRisk" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_analytics_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_predictions_fplPlayerId_gameweek_modelVersion_key" ON "public"."player_predictions"("fplPlayerId", "gameweek", "modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "player_gameweek_history_fplPlayerId_gameweek_season_key" ON "public"."player_gameweek_history"("fplPlayerId", "gameweek", "season");

-- CreateIndex
CREATE UNIQUE INDEX "player_risk_assessments_fplPlayerId_key" ON "public"."player_risk_assessments"("fplPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "team_analytics_fplTeamId_key" ON "public"."team_analytics"("fplTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_accuracy_modelVersion_gameweek_key" ON "public"."prediction_accuracy"("modelVersion", "gameweek");

-- CreateIndex
CREATE UNIQUE INDEX "user_analytics_preferences_userId_key" ON "public"."user_analytics_preferences"("userId");

-- AddForeignKey
ALTER TABLE "public"."user_analytics_preferences" ADD CONSTRAINT "user_analytics_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
