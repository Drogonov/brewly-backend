import { Injectable } from '@nestjs/common';
import {
    SampleRequestDto,
    StatusType,
    IStatusResponse,
    IGetSampleTypesResponse,
    ISampleTypeInfoResponse,
    ICoffeePackInfoResponse,
    IGetSampleCreationOptionsResponse,
    IGetCoffeePacksInfoResponse,
} from './dto';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import { MappingService } from 'src/app/common/services/mapping.service';
import { ErrorHandlingService } from 'src/app/common/error-handling/error-handling.service';
import { IconsService } from 'src/app/common/services/icons/icons.service';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';
import { LocalizationOptionsListService } from 'src/app/common/localization/localization-options-list/localization-options-list.service';
import { LocalizationOptionListConst } from 'src/app/common/localization/localization-options-list/localization-options-list.model';
import { BusinessErrorKeys, SamplesKeys } from 'src/app/common/localization/generated';
import { ArchiveSampleDto } from './dto/archive-sample.request.dto';
import { SampleType } from '@prisma/client';

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
        try {
            const beanOriginOptionList =
                await this.localizationOptionsListService.getOptionsList(
                    LocalizationOptionListConst.BEAN_ORIGIN,
                );
            const processingMethodOptionList =
                await this.localizationOptionsListService.getOptionsList(
                    LocalizationOptionListConst.PROCESSING_METHOD,
                );

            return {
                options: [
                    this.mappingService.mapOptionList(beanOriginOptionList),
                    this.mappingService.mapOptionList(processingMethodOptionList),
                ],
            };
        } catch (error) {
            throw error
        }
    }

    async createSample(
        userId: number,
        currentCompanyId: number,
        dto: SampleRequestDto,
    ): Promise<IStatusResponse> {
        try {
            // Map coffee packs if provided; if not, leave it undefined.
            const sampleItemsData =
                dto.coffeePacksInfo && dto.coffeePacksInfo.length
                    ? {
                        create: dto.coffeePacksInfo.map((pack) => ({
                            companyId: currentCompanyId,
                            roastDate: new Date(pack.roastDate),
                            openDate: pack.openDate ? new Date(pack.openDate) : null,
                            packIsOver: pack.packIsOver ?? false,
                            weight: pack.weight,
                            barCode: pack.barCode,
                        })),
                    }
                    : undefined;

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
                    // Only include sampleItems if coffee packs were provided.
                    ...(sampleItemsData ? { sampleItems: sampleItemsData } : {}),
                },
            });

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getSamplesText(
                    SamplesKeys.SAMPLE_CREATED_SUCCESSFULLY,
                ),
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.SAMPLE_CREATION_FAILED,
            );
        }
    }

    async updateSample(
        userId: number,
        currentCompanyId: number,
        dto: SampleRequestDto,
    ): Promise<IStatusResponse> {
        // Validation: update method requires sampleTypeId.
        if (!dto.sampleTypeInfo.sampleTypeId) {
            // Missing ID → validation error
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }
        const sampleTypeId = dto.sampleTypeInfo.sampleTypeId;

        try {
            // 1) Update the sample type record.
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

            // 2) Proceed only if coffeePacksInfo is provided
            if (dto.coffeePacksInfo && dto.coffeePacksInfo.length > 0) {
                for (const pack of dto.coffeePacksInfo) {
                    if (pack.packId) {
                        // Update an existing coffee pack.
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
                        // Create a new coffee pack associated with the sample.
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
            }

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getSamplesText(
                    SamplesKeys.SAMPLE_UPDATED_SUCCESSFULLY,
                ),
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.SAMPLE_UPDATE_FAILED,
            );
        }
    }

    async archiveSample(
        userId: number,
        currentCompanyId: number,
        dto: ArchiveSampleDto,
    ): Promise<IStatusResponse> {
        try {
            const sample: SampleType = await this.prisma.sampleType.findUnique({
                where: { id: dto.sampleTypeId },
                include: { sampleItems: true },
            });

            if (!sample) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.SAMPLE_DOESNT_EXIST,
                );
            }

            await this.prisma.sampleType.update({
                where: { id: sample.id },
                data: {
                    isArchived: dto.isArchived,
                },
            });

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getSamplesText(
                    SamplesKeys.SAMPLE_UPDATED_SUCCESSFULLY,
                ),
            };
        } catch (error) {
            throw error
        }
    }

    async getSampleInfo(
        userId: number,
        currentCompanyId: number,
        sampleId: number,
    ): Promise<ISampleTypeInfoResponse> {
        try {
            const sample = await this.prisma.sampleType.findUnique({
                where: { id: sampleId },
                include: { sampleItems: true },
            });

            if (!sample) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.SAMPLE_DOESNT_EXIST,
                );
            }
            const beanOriginOptionList =
                await this.localizationOptionsListService.getOptionsList(
                    LocalizationOptionListConst.BEAN_ORIGIN,
                    sample.beanOriginCode,
                );
            const processingMethodOptionList =
                await this.localizationOptionsListService.getOptionsList(
                    LocalizationOptionListConst.PROCESSING_METHOD,
                    sample.procecingMethodCode,
                );

            // Map each coffee pack (SampleItems) into the response format.
            const coffeePacksInfo: ICoffeePackInfoResponse[] = sample.sampleItems.map(
                (pack) => ({
                    id: pack.id,
                    roastDate: pack.roastDate.toISOString(),
                    openDate: pack.openDate ? pack.openDate.toISOString() : undefined,
                    weight: pack.weight,
                    barCode: pack.barCode,
                    packIsOver: pack.packIsOver,
                }),
            );

            // Construct the sample type info response.
            const sampleTypeInfo: ISampleTypeInfoResponse = {
                sampleTypeId: sample.id,
                companyName: sample.originCompanyName,
                sampleName: sample.sampleName,
                beanOrigin: this.mappingService.mapOptionList(beanOriginOptionList),
                procecingMethod:
                    this.mappingService.mapOptionList(processingMethodOptionList),
                roastType: sample.roastType,
                grindType: sample.grindType,
                labels: sample.labels,
                isArchived: sample.isArchived,
                connectedPacksInfo: coffeePacksInfo,
            };

            return sampleTypeInfo;
        } catch (error) {
            // If anything goes wrong while building the DTO or fetching options
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }
    }

    async getSampleTypes(
        userId: number,
        currentCompanyId: number,
    ): Promise<IGetSampleTypesResponse> {
        try {
            const sampleTypes = await this.prisma.sampleType.findMany({
                where: {
                    company: {
                        some: { id: currentCompanyId },
                    },
                },
                include: { sampleItems: true },
            });

            const sampleTypesInfo: ISampleTypeInfoResponse[] = await Promise.all(
                sampleTypes.map(async (sample) => {
                    const beanOriginOptionList =
                        await this.localizationOptionsListService.getOptionsList(
                            LocalizationOptionListConst.BEAN_ORIGIN,
                            sample.beanOriginCode,
                        );
                    const processingMethodOptionList =
                        await this.localizationOptionsListService.getOptionsList(
                            LocalizationOptionListConst.PROCESSING_METHOD,
                            sample.procecingMethodCode,
                        );

                    // Calculate a packs description string.
                    // For instance: "2 packs of 250g and 1 pack of 1000g"
                    const packsCount: Record<number, number> = sample.sampleItems.reduce(
                        (acc, item) => {
                            acc[item.weight] = (acc[item.weight] || 0) + 1;
                            return acc;
                        },
                        {} as Record<number, number>,
                    );
                    const packsInWarehouseDescription = Object.entries(packsCount)
                        .map(
                            ([weight, count]) =>
                                `${count} pack${count > 1 ? 's' : ''} of ${weight}g`,
                        )
                        .join(' and ');

                    // Map each coffee pack (SampleItems) into the response format.
                    const coffeePacksInfo: ICoffeePackInfoResponse[] = sample.sampleItems.map(
                        (pack) => ({
                            id: pack.id,
                            roastDate: pack.roastDate.toISOString(),
                            openDate: pack.openDate
                                ? pack.openDate.toISOString()
                                : undefined,
                            weight: pack.weight,
                            barCode: pack.barCode,
                            packIsOver: pack.packIsOver,
                        }),
                    );

                    return {
                        sampleTypeId: sample.id,
                        companyName: sample.originCompanyName,
                        sampleName: sample.sampleName,
                        beanOrigin: this.mappingService.mapOptionList(
                            beanOriginOptionList,
                        ),
                        procecingMethod: this.mappingService.mapOptionList(
                            processingMethodOptionList,
                        ),
                        roastType: sample.roastType,
                        grindType: sample.grindType,
                        labels: sample.labels,
                        packsInWarehouseDescription:
                            packsInWarehouseDescription || null,
                        connectedPacksInfo: coffeePacksInfo,
                        isArchived: sample.isArchived,
                    };
                }),
            );

            return { sampleTypesInfo };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }
    }

    async getCoffeePacksInfo(
        userId: number,
        currentCompanyId: number,
        packsIds: number[],
    ): Promise<IGetCoffeePacksInfoResponse> {
        try {
            const coffeePacks = await this.prisma.coffeePack.findMany({
                where: {
                    companyId: currentCompanyId,
                    id: { in: packsIds },
                },
            });

            const coffeePacksInfo: ICoffeePackInfoResponse[] = coffeePacks.map(
                (pack) => ({
                    id: pack.id,
                    roastDate: pack.roastDate.toISOString(),
                    openDate: pack.openDate ? pack.openDate.toISOString() : undefined,
                    weight: pack.weight,
                    barCode: pack.barCode,
                    packIsOver: pack.packIsOver,
                }),
            );

            return { coffeePacksInfo };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }
    }
}