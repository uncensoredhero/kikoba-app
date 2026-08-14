-- Initial persistent backend schema for Kikoba.
-- This migration creates the social, Chama, savings and score foundation.

CREATE TYPE "GoalStatus" AS ENUM ('DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED','EXPIRED');
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING','PARTIAL','ON_TIME','GRACE','LATE','MISSED','RECOVERED');
CREATE TYPE "DepositStatus" AS ENUM ('PENDING','SUCCESSFUL','FAILED','REVERSED');
CREATE TYPE "AllocationMode" AS ENUM ('EXPLICIT','AUTO_ALLOCATE');
CREATE TYPE "Priority" AS ENUM ('HIGH','NORMAL','LOW');
CREATE TYPE "EventType" AS ENUM ('DEPOSIT_SUCCESS','DEPOSIT_REVERSED','CONTRIBUTION_COMPLETED','CONTRIBUTION_PARTIAL','CONTRIBUTION_LATE','CONTRIBUTION_MISSED','CONTRIBUTION_RECOVERED','GOAL_COMPLETED','GOAL_CANCELLED','GOAL_EXPIRED','CHAMA_JOINED','CHAMA_LEFT','WITHDRAWAL_COMPLETED');
CREATE TYPE "ChamaType" AS ENUM ('LONG_TERM','SHORT_TERM');
CREATE TYPE "ChamaFrequency" AS ENUM ('WEEKLY','MONTHLY');
CREATE TYPE "MembershipRole" AS ENUM ('CREATOR','ADMIN','MEMBER');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE','LEFT','REMOVED','PENDING');
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING','ACCEPTED','DECLINED','BLOCKED');

CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL, "username" TEXT NOT NULL UNIQUE, "profilePhotoUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Chama" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "type" "ChamaType" NOT NULL, "contribution" DECIMAL(18,2) NOT NULL, "frequency" "ChamaFrequency" NOT NULL, "maxMembers" INTEGER NOT NULL, "minTier" TEXT NOT NULL, "goal" TEXT, "status" TEXT NOT NULL DEFAULT 'ACTIVE', "ownerId" TEXT NOT NULL REFERENCES "User"("id"), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ChamaMember" ("id" TEXT PRIMARY KEY, "chamaId" TEXT NOT NULL REFERENCES "Chama"("id") ON DELETE CASCADE, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER', "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE', "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "leftAt" TIMESTAMP(3), UNIQUE("chamaId","userId"));
CREATE TABLE "FriendRequest" ("id" TEXT PRIMARY KEY, "fromId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "toId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Friendship" ("id" TEXT PRIMARY KEY, "userAId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "userBId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("userAId","userBId"));
CREATE TABLE "Conversation" ("id" TEXT PRIMARY KEY, "chamaId" TEXT UNIQUE REFERENCES "Chama"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ConversationMember" ("id" TEXT PRIMARY KEY, "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("conversationId","userId"));
CREATE TABLE "Message" ("id" TEXT PRIMARY KEY, "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE, "senderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "body" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "editedAt" TIMESTAMP(3));

CREATE INDEX "Chama_status_type_frequency_idx" ON "Chama"("status","type","frequency");
CREATE INDEX "Chama_ownerId_idx" ON "Chama"("ownerId");
CREATE INDEX "ChamaMember_userId_status_idx" ON "ChamaMember"("userId","status");
CREATE INDEX "ChamaMember_chamaId_status_idx" ON "ChamaMember"("chamaId","status");
CREATE INDEX "FriendRequest_toId_status_idx" ON "FriendRequest"("toId","status");
CREATE INDEX "FriendRequest_fromId_status_idx" ON "FriendRequest"("fromId","status");
CREATE INDEX "Friendship_userAId_idx" ON "Friendship"("userAId");
CREATE INDEX "Friendship_userBId_idx" ON "Friendship"("userBId");
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId","createdAt");
