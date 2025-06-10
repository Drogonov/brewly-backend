-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateEnum
CREATE TYPE "FriendshipType" AS ENUM ('REQUEST', 'FRIEND', 'DENIED', 'ENDED');

-- CreateEnum
CREATE TYPE "TeamInvitationType" AS ENUM ('REQUEST', 'TEAM', 'DENIED', 'ENDED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'CHIEF', 'BARISTA');

-- CreateEnum
CREATE TYPE "CompanyRuleType" AS ENUM ('isOwnerChief', 'canChiefMakeChief', 'canChiefInviteUser', 'canChiefCreateCupping', 'isChiefRatesPreferred', 'canBaristaInviteUsers', 'canBaristaCreateCupping');

-- CreateEnum
CREATE TYPE "CuppingType" AS ENUM ('CREATED', 'STARTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('AROMA', 'ACIDITY', 'SWEETNESS', 'BODY', 'AFTERTASTE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userName" TEXT,
    "userImageURL" TEXT,
    "email" TEXT NOT NULL,
    "about" TEXT,
    "hash" TEXT NOT NULL,
    "otpHash" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "isVerificated" BOOLEAN NOT NULL,
    "currentCompanyId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hashedRt" TEXT,
    "userId" INTEGER NOT NULL,
    "type" "SessionType" NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToCompanyRelation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserToCompanyRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "type" "FriendshipType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasLoadedByReceiver" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "type" "TeamInvitationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasLoadedByReceiver" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPersonal" BOOLEAN NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyImageURL" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRule" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL,
    "companyId" INTEGER NOT NULL,
    "companyRuleType" "CompanyRuleType" NOT NULL,
    "ruleForRole" "Role" NOT NULL,

    CONSTRAINT "CompanyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cupping" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cuppingCreatorId" INTEGER NOT NULL,
    "cuppingName" TEXT NOT NULL,
    "cuppingType" "CuppingType" NOT NULL,
    "eventDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "companyId" INTEGER NOT NULL,
    "settingsId" INTEGER NOT NULL,

    CONSTRAINT "Cupping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuppingHiddenPackName" (
    "id" SERIAL NOT NULL,
    "cuppingId" INTEGER NOT NULL,
    "coffeePackName" TEXT NOT NULL,
    "coffeePackId" INTEGER NOT NULL,

    CONSTRAINT "CuppingHiddenPackName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuppingInvitation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cuppingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "wasLoadedByReceiver" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CuppingInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuppingSampleTestingResult" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cuppingId" INTEGER NOT NULL,
    "coffeePackId" INTEGER NOT NULL,
    "averageScore" INTEGER NOT NULL,

    CONSTRAINT "CuppingSampleTestingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuppingSampleTestingPropertyResult" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sampleTestingResultId" INTEGER NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "averageIntensivityScore" INTEGER NOT NULL,
    "averageQualityScore" INTEGER NOT NULL,
    "averageChiefIntensivityScore" INTEGER NOT NULL,
    "averageChiefQualityScore" INTEGER NOT NULL,
    "comments" TEXT[],

    CONSTRAINT "CuppingSampleTestingPropertyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuppingSettings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "randomSamplesOrder" BOOLEAN NOT NULL,
    "openSampleNameCupping" BOOLEAN NOT NULL,
    "singleUserCupping" BOOLEAN NOT NULL,
    "inviteAllTeammates" BOOLEAN NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CuppingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultCuppingSettings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "randomSamplesOrder" BOOLEAN NOT NULL,
    "openSampleNameCupping" BOOLEAN NOT NULL,
    "singleUserCupping" BOOLEAN NOT NULL,
    "inviteAllTeammates" BOOLEAN NOT NULL,
    "defaultCuppingName" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DefaultCuppingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleType" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originCompanyName" TEXT NOT NULL,
    "sampleName" TEXT NOT NULL,
    "beanOriginCode" INTEGER NOT NULL,
    "procecingMethodCode" INTEGER NOT NULL,
    "roastType" INTEGER NOT NULL,
    "grindType" INTEGER NOT NULL,
    "labels" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SampleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeePack" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,
    "sampleTypeId" INTEGER NOT NULL,
    "roastDate" TIMESTAMP(3) NOT NULL,
    "openDate" TIMESTAMP(3),
    "packIsOver" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL,
    "barCode" TEXT,

    CONSTRAINT "CoffeePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleTesting" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "cuppingId" INTEGER NOT NULL,
    "coffeePackId" INTEGER NOT NULL,

    CONSTRAINT "SampleTesting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleProperty" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "intensity" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL,
    "comment" TEXT,
    "sampleTestingId" INTEGER NOT NULL,

    CONSTRAINT "SampleProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SampleTypesOwnedByCompany" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CuppingCoffeePacks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserToCompanyRelation_userId_companyId_key" ON "UserToCompanyRelation"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CuppingSampleTestingResult_cuppingId_coffeePackId_key" ON "CuppingSampleTestingResult"("cuppingId", "coffeePackId");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultCuppingSettings_userId_companyId_key" ON "DefaultCuppingSettings"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "_SampleTypesOwnedByCompany_AB_unique" ON "_SampleTypesOwnedByCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_SampleTypesOwnedByCompany_B_index" ON "_SampleTypesOwnedByCompany"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CuppingCoffeePacks_AB_unique" ON "_CuppingCoffeePacks"("A", "B");

-- CreateIndex
CREATE INDEX "_CuppingCoffeePacks_B_index" ON "_CuppingCoffeePacks"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentCompanyId_fkey" FOREIGN KEY ("currentCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToCompanyRelation" ADD CONSTRAINT "UserToCompanyRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToCompanyRelation" ADD CONSTRAINT "UserToCompanyRelation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRule" ADD CONSTRAINT "CompanyRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupping" ADD CONSTRAINT "Cupping_cuppingCreatorId_fkey" FOREIGN KEY ("cuppingCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupping" ADD CONSTRAINT "Cupping_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupping" ADD CONSTRAINT "Cupping_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "CuppingSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingHiddenPackName" ADD CONSTRAINT "CuppingHiddenPackName_cuppingId_fkey" FOREIGN KEY ("cuppingId") REFERENCES "Cupping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingHiddenPackName" ADD CONSTRAINT "CuppingHiddenPackName_coffeePackId_fkey" FOREIGN KEY ("coffeePackId") REFERENCES "CoffeePack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingInvitation" ADD CONSTRAINT "CuppingInvitation_cuppingId_fkey" FOREIGN KEY ("cuppingId") REFERENCES "Cupping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingInvitation" ADD CONSTRAINT "CuppingInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingSampleTestingResult" ADD CONSTRAINT "CuppingSampleTestingResult_cuppingId_fkey" FOREIGN KEY ("cuppingId") REFERENCES "Cupping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingSampleTestingResult" ADD CONSTRAINT "CuppingSampleTestingResult_coffeePackId_fkey" FOREIGN KEY ("coffeePackId") REFERENCES "CoffeePack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingSampleTestingPropertyResult" ADD CONSTRAINT "CuppingSampleTestingPropertyResult_sampleTestingResultId_fkey" FOREIGN KEY ("sampleTestingResultId") REFERENCES "CuppingSampleTestingResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingSettings" ADD CONSTRAINT "CuppingSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuppingSettings" ADD CONSTRAINT "CuppingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCuppingSettings" ADD CONSTRAINT "DefaultCuppingSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCuppingSettings" ADD CONSTRAINT "DefaultCuppingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeePack" ADD CONSTRAINT "CoffeePack_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeePack" ADD CONSTRAINT "CoffeePack_sampleTypeId_fkey" FOREIGN KEY ("sampleTypeId") REFERENCES "SampleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTesting" ADD CONSTRAINT "SampleTesting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTesting" ADD CONSTRAINT "SampleTesting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTesting" ADD CONSTRAINT "SampleTesting_cuppingId_fkey" FOREIGN KEY ("cuppingId") REFERENCES "Cupping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTesting" ADD CONSTRAINT "SampleTesting_coffeePackId_fkey" FOREIGN KEY ("coffeePackId") REFERENCES "CoffeePack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleProperty" ADD CONSTRAINT "SampleProperty_sampleTestingId_fkey" FOREIGN KEY ("sampleTestingId") REFERENCES "SampleTesting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SampleTypesOwnedByCompany" ADD CONSTRAINT "_SampleTypesOwnedByCompany_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SampleTypesOwnedByCompany" ADD CONSTRAINT "_SampleTypesOwnedByCompany_B_fkey" FOREIGN KEY ("B") REFERENCES "SampleType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CuppingCoffeePacks" ADD CONSTRAINT "_CuppingCoffeePacks_A_fkey" FOREIGN KEY ("A") REFERENCES "CoffeePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CuppingCoffeePacks" ADD CONSTRAINT "_CuppingCoffeePacks_B_fkey" FOREIGN KEY ("B") REFERENCES "Cupping"("id") ON DELETE CASCADE ON UPDATE CASCADE;
