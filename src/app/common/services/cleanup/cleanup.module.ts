import { Global, Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [CleanupService],
    exports: [CleanupService],
})
export class CleanupModule { }