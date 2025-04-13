import { Injectable } from '@nestjs/common';
import {
    SampleRequestDto,
    StatusType,
    IStatusResponse,
    IGetSampleInfoResponse,
    IGetSampleTypesResponse,
    ISampleTypeInfoResponse,
    ICoffeePackInfoResponse,
    IGetSampleCreationOptionsResponse
} from './dto';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { IconsService } from 'src/app.common/services/icons/icons.service';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { LocalizationOptionsListService } from 'src/app.common/localization/localization-options-list/localization-options-list.service';
import { LocalizationOptionListConst } from 'src/app.common/localization/localization-options-list/localization-options-list.model';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { SamplesKeys } from 'src/app.common/localization/generated';

@Injectable()
export class SamplesService {
    constructor(
        private prisma: PrismaService,
        private mappingService: MappingService,
        private errorHandlingService: ErrorHandlingService,
        private iconsService: IconsService,
        private localizationStringsService: LocalizationStringsService,
        private localizationOptionsListService: LocalizationOptionsListService,
    ) { }

    async getSampleCreationOptions(
        userId: number,
        currentCompanyId: number,
    ): Promise<IGetSampleCreationOptionsResponse> {
        const beanOriginOptionList = await this.localizationOptionsListService.getOptionsList(
            LocalizationOptionListConst.BEAN_ORIGIN
        );
        const processingMethodOptionList = await this.localizationOptionsListService.getOptionsList(
            LocalizationOptionListConst.PROCESSING_METHOD
        );

        return {
            options: [
                this.mappingService.mapOptionList(beanOriginOptionList),
                this.mappingService.mapOptionList(processingMethodOptionList),
            ]
        }
    }

    async createSample(
        userId: number,
        currentCompanyId: number,
        dto: SampleRequestDto
    ): Promise<IStatusResponse> {
        try {
            await this.prisma.sampleType.create({
                data: {
                    originCompanyName: dto.sampleTypeInfo.companyName,
                    sampleName: dto.sampleTypeInfo.sampleName,
                    beanOriginCode: dto.sampleTypeInfo.beanOriginCode,
                    procecingMethodCode: dto.sampleTypeInfo.processingMethodCode,
                    roastType: dto.sampleTypeInfo.roastType,
                    grindType: dto.sampleTypeInfo.grindType,
                    labels: dto.sampleTypeInfo.labels,
                    company: {
                        connect: { id: currentCompanyId },
                    },
                    sampleItems: {
                        create: dto.coffeePacksInfo.map(pack => ({
                            companyId: currentCompanyId,
                            roastDate: new Date(pack.roastDate),
                            openDate: pack.openDate ? new Date(pack.openDate) : null,
                            packIsOver: pack.packIsOver ?? false,
                            weight: pack.weight,
                            barCode: pack.barCode,
                        })),
                    },
                },
            });

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getSamplesText(SamplesKeys.SAMPLE_CREATED_SUCCESSFULLY),
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(ErrorSubCode.SAMPLE_CREATION_FAILED);
        }
    }

    async updateSample(
        userId: number,
        currentCompanyId: number,
        dto: SampleRequestDto
    ): Promise<IStatusResponse> {
        if (!dto.sampleTypeInfo.sampleTypeId) {
            throw await this.errorHandlingService.getBusinessError(ErrorSubCode.REQUEST_VALIDATION_ERROR);
        }
        const sampleTypeId = dto.sampleTypeInfo.sampleTypeId;

        try {
            await this.prisma.sampleType.update({
                where: { id: sampleTypeId },
                data: {
                    originCompanyName: dto.sampleTypeInfo.companyName,
                    sampleName: dto.sampleTypeInfo.sampleName,
                    beanOriginCode: dto.sampleTypeInfo.beanOriginCode,
                    procecingMethodCode: dto.sampleTypeInfo.processingMethodCode,
                    roastType: dto.sampleTypeInfo.roastType,
                    grindType: dto.sampleTypeInfo.grindType,
                    labels: dto.sampleTypeInfo.labels,
                },
            });

            // Retrieve existing coffee packs for this sample type.
            const existingCoffeePacks = await this.prisma.coffeePack.findMany({
                where: { sampleTypeId: sampleTypeId },
            });

            // Collect packIds from incoming coffee packs that are existing records.
            const incomingPackIds: number[] = dto.coffeePacksInfo
                .filter((pack) => pack.packId !== undefined)
                .map((pack) => pack.packId as number);

            // Iterate over the incoming coffee packs.
            for (const pack of dto.coffeePacksInfo) {
                if (pack.packId) {
                    // Update existing pack.
                    await this.prisma.coffeePack.update({
                        where: { id: pack.packId },
                        data: {
                            roastDate: new Date(pack.roastDate),
                            openDate: pack.openDate ? new Date(pack.openDate) : null,
                            packIsOver: pack.packIsOver ?? false,
                            weight: pack.weight,
                            barCode: pack.barCode,
                        },
                    });
                } else {
                    // Create a new coffee pack for the sample.
                    await this.prisma.coffeePack.create({
                        data: {
                            companyId: currentCompanyId,
                            sampleTypeId: sampleTypeId,
                            roastDate: new Date(pack.roastDate),
                            openDate: pack.openDate ? new Date(pack.openDate) : null,
                            packIsOver: pack.packIsOver ?? false,
                            weight: pack.weight,
                            barCode: pack.barCode,
                        },
                    });
                }
            }

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getSamplesText(SamplesKeys.SAMPLE_UPDATED_SUCCESSFULLY),
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(ErrorSubCode.SAMPLE_CREATION_FAILED);
        }
    }

    async getSampleInfo(
        userId: number,
        currentCompanyId: number,
        sampleId: number
    ): Promise<IGetSampleInfoResponse> {
        // Retrieve the sample type record along with its related coffee packs.
        const sample = await this.prisma.sampleType.findUnique({
            where: { id: sampleId },
            include: { sampleItems: true },
        });

        // If the sample type doesn't exist, throw an error.
        if (!sample) {
            throw await this.errorHandlingService.getBusinessError(ErrorSubCode.SAMPLE_DOESNT_EXIST);
        }

        // Retrieve localized option lists based on the sample's beanOriginCode and processingMethodCode.
        const beanOriginOptionList = await this.localizationOptionsListService.getOptionsList(
            LocalizationOptionListConst.BEAN_ORIGIN,
            sample.beanOriginCode
        );
        const processingMethodOptionList = await this.localizationOptionsListService.getOptionsList(
            LocalizationOptionListConst.PROCESSING_METHOD,
            sample.procecingMethodCode
        );

        // Construct the sample type info response.
        const sampleTypeInfo: ISampleTypeInfoResponse = {
            sampleTypeId: sample.id,
            companyName: sample.originCompanyName,
            sampleName: sample.sampleName,
            beanOrigin: this.mappingService.mapOptionList(beanOriginOptionList),
            procecingMethod: this.mappingService.mapOptionList(processingMethodOptionList),
            roastType: sample.roastType,
            grindType: sample.grindType,
            labels: sample.labels,
        };

        // Map each coffee pack (SampleItems) into the response format.
        const coffeePacksInfo: ICoffeePackInfoResponse[] = sample.sampleItems.map(pack => ({
            id: pack.id,
            roastDate: pack.roastDate.toISOString(),
            openDate: pack.openDate ? pack.openDate.toISOString() : undefined,
            weight: pack.weight,
            barCode: pack.barCode,
            packIsOver: pack.packIsOver,
        }));

        return {
            sampleTypeInfo,
            coffeePacksInfo,
        };
    }

    async getSampleTypes(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetSampleTypesResponse> {
        // Retrieve sample types that are linked to the current company.
        const sampleTypes = await this.prisma.sampleType.findMany({
            where: {
                company: {
                    some: { id: currentCompanyId },
                },
            },
            include: { sampleItems: true },
        });

        // Map each sample type into the expected response structure.
        const sampleTypesInfo: ISampleTypeInfoResponse[] = await Promise.all(
            sampleTypes.map(async sample => {
                // Retrieve localized options based on the stored codes.
                const beanOriginOptionList = await this.localizationOptionsListService.getOptionsList(
                    LocalizationOptionListConst.BEAN_ORIGIN,
                    sample.beanOriginCode
                );
                const processingMethodOptionList = await this.localizationOptionsListService.getOptionsList(
                    LocalizationOptionListConst.PROCESSING_METHOD,
                    sample.procecingMethodCode
                );

                // Calculate a packs description string.
                // For instance: "2 packs of 250g and 1 pack of 1000g"
                const packsCount: Record<number, number> = sample.sampleItems.reduce((acc, item) => {
                    acc[item.weight] = (acc[item.weight] || 0) + 1;
                    return acc;
                }, {} as Record<number, number>);
                const packsInWarehouseDescription = Object.entries(packsCount)
                    .map(([weight, count]) => `${count} pack${count > 1 ? "s" : ""} of ${weight}g`)
                    .join(" and ");

                return {
                    sampleTypeId: sample.id,
                    companyName: sample.originCompanyName,
                    sampleName: sample.sampleName,
                    beanOrigin: this.mappingService.mapOptionList(beanOriginOptionList),
                    procecingMethod: this.mappingService.mapOptionList(processingMethodOptionList),
                    roastType: sample.roastType,
                    grindType: sample.grindType,
                    labels: sample.labels,
                    packsInWarehouseDescription: packsInWarehouseDescription || null,
                };
            })
        );

        return { sampleTypesInfo };
    }
}