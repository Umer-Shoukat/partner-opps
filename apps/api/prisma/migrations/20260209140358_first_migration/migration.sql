-- CreateEnum
CREATE TYPE "MerchantAppStatus" AS ENUM ('installed', 'uninstalled', 'paused');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('push', 'backfill');

-- CreateEnum
CREATE TYPE "IngestionKeyStatus" AS ENUM ('active', 'revoked');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'frozen', 'pending', 'expired');

-- CreateEnum
CREATE TYPE "BillingAttemptStatus" AS ENUM ('success', 'failed');

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppIngestionKey" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "status" "IngestionKeyStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AppIngestionKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "shopifyShopId" BIGINT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "shopName" TEXT,
    "email" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantApp" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "status" "MerchantAppStatus" NOT NULL,
    "installedAt" TIMESTAMP(3),
    "uninstalledAt" TIMESTAMP(3),
    "installSource" TEXT,
    "lastEventAt" TIMESTAMP(3),

    CONSTRAINT "MerchantApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "merchantId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventTs" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schemaVersion" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "source" "EventSource" NOT NULL,
    "hash" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "shopifySubscriptionId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "planCode" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "cappedAmount" DECIMAL(12,2),
    "trialEndsAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAttempt" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "attemptTs" TIMESTAMP(3) NOT NULL,
    "status" "BillingAttemptStatus" NOT NULL,
    "failureCode" TEXT,
    "failureReason" TEXT,
    "raw" JSONB,

    CONSTRAINT "BillingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantTag" (
    "merchantId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantTag_pkey" PRIMARY KEY ("merchantId","tag")
);

-- CreateTable
CREATE TABLE "MerchantNote" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyInstallRollup" (
    "day" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,
    "installs" INTEGER NOT NULL,
    "uninstalls" INTEGER NOT NULL,
    "activeInstallsEndOfDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyInstallRollup_pkey" PRIMARY KEY ("day","appId")
);

-- CreateTable
CREATE TABLE "DailyMrrRollup" (
    "day" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "mrr" DECIMAL(14,2) NOT NULL,
    "arr" DECIMAL(14,2) NOT NULL,
    "activePayingMerchants" INTEGER NOT NULL,
    "newMrr" DECIMAL(14,2) NOT NULL,
    "expansionMrr" DECIMAL(14,2) NOT NULL,
    "contractionMrr" DECIMAL(14,2) NOT NULL,
    "churnedMrr" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "DailyMrrRollup_pkey" PRIMARY KEY ("day","appId","currency")
);

-- CreateTable
CREATE TABLE "PartnerDailyMetric" (
    "day" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "installs" INTEGER,
    "uninstalls" INTEGER,
    "activeInstalls" INTEGER,
    "revenueGross" DECIMAL(14,2),
    "revenueNet" DECIMAL(14,2),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw" JSONB,

    CONSTRAINT "PartnerDailyMetric_pkey" PRIMARY KEY ("day","appId","currency")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AppIngestionKey_keyId_key" ON "AppIngestionKey"("keyId");

-- CreateIndex
CREATE INDEX "AppIngestionKey_appId_status_idx" ON "AppIngestionKey"("appId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_shopifyShopId_key" ON "Merchant"("shopifyShopId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_shopDomain_key" ON "Merchant"("shopDomain");

-- CreateIndex
CREATE INDEX "MerchantApp_appId_status_installedAt_idx" ON "MerchantApp"("appId", "status", "installedAt");

-- CreateIndex
CREATE INDEX "MerchantApp_merchantId_status_idx" ON "MerchantApp"("merchantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantApp_merchantId_appId_key" ON "MerchantApp"("merchantId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");

-- CreateIndex
CREATE INDEX "Event_appId_eventTs_idx" ON "Event"("appId", "eventTs" DESC);

-- CreateIndex
CREATE INDEX "Event_merchantId_eventTs_idx" ON "Event"("merchantId", "eventTs" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_shopifySubscriptionId_key" ON "Subscription"("shopifySubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_appId_status_idx" ON "Subscription"("appId", "status");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_appId_status_idx" ON "Subscription"("merchantId", "appId", "status");

-- CreateIndex
CREATE INDEX "Subscription_appId_currentPeriodEnd_idx" ON "Subscription"("appId", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "BillingAttempt_appId_attemptTs_idx" ON "BillingAttempt"("appId", "attemptTs");

-- CreateIndex
CREATE INDEX "BillingAttempt_appId_status_attemptTs_idx" ON "BillingAttempt"("appId", "status", "attemptTs");

-- CreateIndex
CREATE INDEX "MerchantTag_tag_idx" ON "MerchantTag"("tag");

-- CreateIndex
CREATE INDEX "MerchantNote_merchantId_createdAt_idx" ON "MerchantNote"("merchantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DailyInstallRollup_appId_day_idx" ON "DailyInstallRollup"("appId", "day" DESC);

-- CreateIndex
CREATE INDEX "DailyMrrRollup_appId_day_idx" ON "DailyMrrRollup"("appId", "day" DESC);

-- CreateIndex
CREATE INDEX "PartnerDailyMetric_appId_day_idx" ON "PartnerDailyMetric"("appId", "day" DESC);

-- AddForeignKey
ALTER TABLE "AppIngestionKey" ADD CONSTRAINT "AppIngestionKey_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantApp" ADD CONSTRAINT "MerchantApp_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantApp" ADD CONSTRAINT "MerchantApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantTag" ADD CONSTRAINT "MerchantTag_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantNote" ADD CONSTRAINT "MerchantNote_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyInstallRollup" ADD CONSTRAINT "DailyInstallRollup_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMrrRollup" ADD CONSTRAINT "DailyMrrRollup_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerDailyMetric" ADD CONSTRAINT "PartnerDailyMetric_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
