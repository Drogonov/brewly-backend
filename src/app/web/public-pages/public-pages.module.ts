import { Module } from "@nestjs/common";
import { PublicPagesController } from "./public-pages.controller";

@Module({
  imports: [],
  controllers: [PublicPagesController],
  providers: [],
})
export class PublicPagesModule {}