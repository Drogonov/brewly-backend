-- DropForeignKey
ALTER TABLE "CuppingHiddenPackName" DROP CONSTRAINT "CuppingHiddenPackName_cuppingId_fkey";

-- AddForeignKey
ALTER TABLE "CuppingHiddenPackName" ADD CONSTRAINT "CuppingHiddenPackName_cuppingId_fkey" FOREIGN KEY ("cuppingId") REFERENCES "Cupping"("id") ON DELETE CASCADE ON UPDATE CASCADE;
