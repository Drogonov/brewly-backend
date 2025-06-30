import { Inject, Injectable } from '@nestjs/common';
import {
    CreateCuppingRequestDto,
    CuppingStatus,
    IGetCuppingResponse,
    IGetCuppingSampleResponse,
    IGetCuppingsListResponse,
    IGetCuppingStatusResponse,
    IStatusResponse,
    SetCuppingStatusRequestDto,
    SetCuppingTestsRequestDto,
    StatusResponseDto,
    StatusType,
} from './dto';
import { ErrorHandlingService } from 'src/app/common/error-handling/error-handling.service';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import {
    Cupping,
    CuppingType,
    PrismaClient,
    PropertyType,
    Role,
    SampleProperty,
    SampleTesting,
} from '@prisma/client';
import { MappingService } from 'src/app/common/services/mapping.service';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';
import { BusinessErrorKeys, CuppingKeys } from 'src/app/common/localization/generated';

@Injectable()
export class CuppingService {
    constructor(
        @Inject(PrismaClient) private readonly prisma: PrismaClient,
        private readonly errorHandlingService: ErrorHandlingService,
        private readonly localizationStringsService: LocalizationStringsService,
        private readonly mappingService: MappingService,
    ) { }

    //
    // ─── 1) CREATE CUPPING ────────────────────────────────────────────────────────
    //
    async createCupping(
        userId: number,
        currentCompanyId: number,
        dto: CreateCuppingRequestDto,
    ): Promise<IStatusResponse> {
        const { samples, settings, chosenUserIds } = dto;

        // Determine invited users
        const invitedUserIds = settings.inviteAllTeammates
            ? (
                await this.prisma.userToCompanyRelation.findMany({
                    where: { companyId: currentCompanyId },
                    select: { userId: true },
                })
            ).map((r) => r.userId)
            : chosenUserIds || [];

        // Ensure the creator is included
        if (!invitedUserIds.includes(userId)) {
            invitedUserIds.push(userId);
        }

        try {
            const [created] = await this.prisma.$transaction([
                // 1) Create cupping + nested settings + connect relations
                this.prisma.cupping.create({
                    data: {
                        cuppingCreator: { connect: { id: userId } },
                        cuppingName: settings.cuppingName,
                        cuppingType: CuppingType.CREATED,
                        company: { connect: { id: currentCompanyId } },
                        settings: {
                            create: {
                                randomSamplesOrder: settings.randomSamplesOrder,
                                openSampleNameCupping: settings.openSampleNameCupping,
                                singleUserCupping: settings.singleUserCupping,
                                inviteAllTeammates: settings.inviteAllTeammates,
                                company: { connect: { id: currentCompanyId } },
                                user: { connect: { id: userId } },
                            },
                        },
                        coffeePacks: {
                            connect: samples.map((s) => ({ id: s.packId })),
                        },
                    },
                }),
            ]);

            // 2) Add hidden sample names (if needed)
            if (!settings.openSampleNameCupping) {
                await this.prisma.cuppingHiddenPackName.createMany({
                    data: samples.map((sample) => ({
                        cuppingId: created.id,
                        coffeePackId: sample.packId,
                        coffeePackName: sample.hiddenSampleName,
                    })),
                    skipDuplicates: true,
                });
            }

            // 3) Bulk create invitations, skip duplicates
            await this.prisma.cuppingInvitation.createMany({
                data: invitedUserIds.map((uId) => ({ cuppingId: created.id, userId: uId })),
                skipDuplicates: true,
            });

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getCuppingText(
                    CuppingKeys.CREATE_CUPPING_SUCCESS,
                    { cuppingId: created.id },
                ),
            };
        } catch (error) {
            throw error;
        }
    }

    //
    // ─── 2) GET CUPPINGS LIST ─────────────────────────────────────────────────────
    //
    async getCuppingsList(
        userId: number,
        currentCompanyId: number,
    ): Promise<IGetCuppingsListResponse> {
        try {
            const cuppings = await this.prisma.cupping.findMany({
                where: { companyId: currentCompanyId },
                include: {
                    settings: true,
                    sampleTestings: { select: { userId: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return {
                cuppings: cuppings.map((cup) =>
                    this.mappingService.mapCupping(
                        cup as Cupping & { settings: any },
                        this.hasUserEndTesting(cup, userId),
                    ),
                ),
            };
        } catch (error) {
            throw error;
        }
    }

    //
    // ─── 3) GET SINGLE CUPPING ────────────────────────────────────────────────────
    //
    async getCupping(
        userId: number,
        currentCompanyId: number,
        cuppingId: number,
    ): Promise<IGetCuppingResponse> {
        try {
            // 1) Fetch the cupping (with all related data we need)
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId },
                include: {
                    cuppingCreator: true,
                    settings: true,
                    invitations: { select: { userId: true } },
                    coffeePacks: { include: { sampleType: true } },
                    sampleTestings: {
                        where: { userId },
                        include: {
                            coffeePack: true,
                            userSampleProperties: true,
                        },
                    },
                    cuppingHiddenPackNames: true,
                    cuppingResult: {
                        include: { cuppingSampleTestingPropertyResult: true },
                    },
                },
            });

            // 2) Not found?
            if (!cupping) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.CUPPING_NOT_FOUND,
                );
            }

            // 3) Wrong company?
            if (cupping.companyId !== currentCompanyId) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.CUPPING_ACCESS_DENIED,
                );
            }

            // 4) Not invited?
            const invitedIds = cupping.invitations.map((inv) => inv.userId);
            if (!invitedIds.includes(userId)) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.USER_NOT_INVITED,
                );
            }

            // 5) Does user have “strong” permissions?
            const relation = await this.prisma.userToCompanyRelation.findUnique({
                where: {
                    userId_companyId: { userId, companyId: currentCompanyId },
                },
            });
            const isUserHaveStrongPermissions =
                cupping.cuppingCreatorId === userId || relation?.role === Role.OWNER;

            // 6) Choose the appropriate subtype response
            let responsePromise: IGetCuppingResponse;

            switch (cupping.cuppingType) {
                case CuppingType.CREATED:
                    responsePromise = await this.getCreatedCupping(
                        userId,
                        cupping,
                        isUserHaveStrongPermissions,
                    );
                    break;

                case CuppingType.STARTED:
                    if (this.hasUserEndTesting(cupping, userId)) {
                        responsePromise = await this.getLoaderCupping(
                            userId,
                            cupping,
                            isUserHaveStrongPermissions,
                        );
                    } else {
                        responsePromise = await this.getInProgressCupping(
                            userId,
                            cupping,
                            isUserHaveStrongPermissions,
                            cupping.settings.randomSamplesOrder
                        );
                    }
                    break;

                case CuppingType.ARCHIVED:
                    responsePromise = await this.getEndedCupping(userId, cupping);
                    break;

                default:
                    responsePromise = await this.getCreatedCupping(
                        userId,
                        cupping,
                        isUserHaveStrongPermissions,
                    );
                    break;
            }

            return responsePromise;
        } catch (error) {
            throw error;
        }
    }

    //
    // ─── 4) GET CUPPING STATUS ───────────────────────────────────────────────────
    //
    async getCuppingStatus(
        userId: number,
        currentCompanyId: number,
        cuppingId: number,
    ): Promise<IGetCuppingStatusResponse> {
        // Fetch just enough to check companyId & sampleTestings
        const cupping = await this.prisma.cupping.findUnique({
            where: { id: cuppingId },
            include: { sampleTestings: true },
        });

        if (!cupping) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_NOT_FOUND,
            );
        }

        if (cupping.companyId !== currentCompanyId) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_ACCESS_DENIED,
            );
        }

        return {
            status: this.mappingService.translateTypeToStatus(
                cupping.cuppingType,
                this.hasUserEndTesting(cupping, userId),
            ),
        };
    }

    //
    // ─── 5) SET CUPPING STATUS ───────────────────────────────────────────────────
    //
    async setCuppingStatus(
        userId: number,
        currentCompanyId: number,
        dto: SetCuppingStatusRequestDto,
    ): Promise<StatusResponseDto> {
        const { cuppingId, cuppingStatus } = dto;

        // 1) Fetch the cupping along with its creator & companyId
        const cupping = await this.prisma.cupping.findUnique({
            where: { id: cuppingId },
            select: { cuppingCreatorId: true, companyId: true, cuppingType: true },
        });

        if (!cupping) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_NOT_FOUND,
            );
        }

        if (cupping.companyId !== currentCompanyId) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_ACCESS_DENIED,
            );
        }

        // 2) Check permissions: only the creator or company OWNER can change status
        const relation = await this.prisma.userToCompanyRelation.findUnique({
            where: {
                userId_companyId: { userId, companyId: currentCompanyId },
            },
        });
        const isOwnerOrCreator =
            cupping.cuppingCreatorId === userId || relation?.role === Role.OWNER;
        if (!isOwnerOrCreator) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_ACCESS_DENIED,
            );
        }

        // 3) Validate status transition
        const currentType = cupping.cuppingType;
        const requestedType = this.mappingService.translateStatusToType(
            cuppingStatus,
        );

        // Only allow: CREATED → STARTED → ARCHIVED (no other jumps)
        const allowedTransitions: Record<CuppingType, CuppingType[]> = {
            [CuppingType.CREATED]: [CuppingType.STARTED],
            [CuppingType.STARTED]: [CuppingType.ARCHIVED],
            [CuppingType.ARCHIVED]: [], // once archived, no changes
        };

        console.log(allowedTransitions);
        console.log(requestedType);

        if (!allowedTransitions[currentType].includes(requestedType)) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.INVALID_CUPPING_STATUS_TRANSITION,
            );
        }

        // 4) If archiving, ensure there are test results to save
        if (requestedType === CuppingType.ARCHIVED) {
            await this.saveCuppingResults(cuppingId);
        }

        // 5) Update the cuppingType (and if ARCHIVED, also set endDate)
        await this.prisma.cupping.update({
            where: { id: cuppingId },
            data: { cuppingType: requestedType },
        });

        if (requestedType === CuppingType.ARCHIVED) {
            await this.prisma.cupping.update({
                where: { id: cuppingId },
                data: { endDate: new Date() },
            });
        }

        return {
            status: StatusType.SUCCESS,
            description: await this.localizationStringsService.getCuppingText(
                CuppingKeys.CUPPING_STATUS_UPDATED,
                { cuppingId, cuppingStatus: requestedType },
            ),
        };
    }

    //
    // ─── 6) SET CUPPING TESTS ────────────────────────────────────────────────────
    //
    async setCuppingTests(
        userId: number,
        currentCompanyId: number,
        dto: SetCuppingTestsRequestDto,
    ): Promise<StatusResponseDto> {
        const { tests } = dto;

        console.log(tests);

        // 1) Must provide at least one test
        if (!tests || tests.length === 0) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.NO_TESTS_PROVIDED,
            );
        }

        // 2) Extract cuppingId from the first test (all tests must have the same cuppingId)
        const cuppingId = tests[0].cuppingId;

        // 3) Fetch the cupping along with its invitations & type
        const cupping = await this.prisma.cupping.findUnique({
            where: { id: cuppingId },
            select: {
                companyId: true,
                cuppingType: true,
                invitations: { select: { userId: true } },
                coffeePacks: { select: { id: true } },
            },
        });

        if (!cupping) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_NOT_FOUND,
            );
        }

        if (cupping.companyId !== currentCompanyId) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CUPPING_ACCESS_DENIED,
            );
        }

        // 4) Ensure user is invited
        const invitedIds = cupping.invitations.map((inv) => inv.userId);
        if (!invitedIds.includes(userId)) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.USER_NOT_INVITED,
            );
        }

        // 5) Ensure cupping is “in progress”
        if (cupping.cuppingType !== CuppingType.STARTED) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.CANNOT_RECORD_TESTS,
            );
        }

        // 6) Check that each coffeePackId belongs to this cupping
        const packIdsInCupping = new Set<number>(
            cupping.coffeePacks.map((p) => p.id),
        );
        for (const test of tests) {
            if (!packIdsInCupping.has(test.coffeePackId)) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.SAMPLE_NOT_IN_CUPPING,
                );
            }
        }

        // 7) Create all SampleTesting + nested properties in a transaction
        try {
            const createdEntries = await this.prisma.$transaction(
                tests.map((test) => {
                    const { coffeePackId, properties } = test;
                    return this.prisma.sampleTesting.create({
                        data: {
                            userId,
                            companyId: currentCompanyId,
                            cuppingId,
                            coffeePackId,
                            userSampleProperties: {
                                create: properties.map((p) => ({
                                    propertyType: this.mappingService.translateTestToPropertyType(
                                        p.testPropertyType,
                                    ),
                                    intensity: p.intensity,
                                    quality: p.quality,
                                    comment: p.comment,
                                })),
                            },
                        },
                    });
                }),
            );

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getCuppingText(
                    CuppingKeys.SAMPLE_TESTS_RECORDED,
                    { sampleTestsAmount: createdEntries.length },
                ),
            };
        } catch (error) {
            throw error;
        }
    }

    // MARK: - Private Methods

    /** Returns true if the given user has already submitted any SampleTesting */
    private hasUserEndTesting(
        cupping: Cupping & { sampleTestings: { userId: number }[] },
        userId: number,
    ): boolean {
        return cupping.sampleTestings.some((t) => t.userId === userId);
    }

    private async getCreatedCupping(
        userId: number,
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.planned,
            isUserHaveStrongPermissions,
            false,
            false,
        );
    }

    private async getInProgressCupping(
        userId: number,
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean,
        shouldUseRandomSampleOrder: boolean
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.inProgress,
            isUserHaveStrongPermissions,
            true,
            shouldUseRandomSampleOrder,
        );
    }

    private async getLoaderCupping(
        userId: number,
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.doneByCurrentUser,
            isUserHaveStrongPermissions,
            false,
            false
        );
    }

    private async getEndedCupping(
        userId: number,
        cupping: Cupping & any,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.ended,
            false,
            true,
            false
        );
    }

    private buildResponse(
        userId: number,
        cupping: Cupping & any,
        status: CuppingStatus,
        isUserHaveStrongPermissions: boolean,
        includeSamples = true,
        shouldUseRandomSampleOrder: boolean,
    ): IGetCuppingResponse {
        const samples = includeSamples
            ? this.mappingService.mapCuppingSamples(cupping, userId)
            : []

        return {
            status,
            cuppingName: cupping.cuppingName,
            eventDate: cupping.eventDate?.toISOString(),
            endDate: cupping.endDate?.toISOString() ?? null,
            canUserStartCupiing: isUserHaveStrongPermissions,
            canUserEndCupiing: isUserHaveStrongPermissions,
            samples: shouldUseRandomSampleOrder ? this.shuffle(samples) : samples,
        };
    }

    /**
     * When archiving a cupping, first delete any old results, then re‐compute
     * and insert new ones. If the cupping cannot be found → CUPPING_NOT_FOUND.
     * If there are zero sampleTestings → NO_TEST_RESULTS (we disallow archiving).
     */
    private async saveCuppingResults(cuppingId: number) {
        try {
            // STEP 0: Delete old results for this cupping, if any exist
            await this.prisma.cuppingSampleTestingResult.deleteMany({
                where: { cuppingId },
            });

            // STEP 1: Reload the cupping plus all sampleTestings + nested properties
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId },
                select: {
                    cuppingCreatorId: true,
                    sampleTestings: {
                        include: { userSampleProperties: true },
                    },
                },
            });

            if (!cupping) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.CUPPING_NOT_FOUND,
                );
            }

            const allTestings = cupping.sampleTestings;
            if (allTestings.length === 0) {
                // You cannot archive a cupping with no test results
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.NO_TEST_RESULTS,
                );
            }

            const chiefUserId = cupping.cuppingCreatorId;

            // STEP 2: Group SampleTesting rows by coffeePackId
            const testsByPack = new Map<
                number,
                (SampleTesting & { userSampleProperties: SampleProperty[] })[]
            >();
            for (const testing of allTestings) {
                const packId = testing.coffeePackId;
                if (!testsByPack.has(packId)) {
                    testsByPack.set(packId, []);
                }
                testsByPack.get(packId)!.push(testing);
            }

            // STEP 3: For each coffeePackId, compute averages & insert results
            const propertyCount = 5; // We know there are exactly 5 PropertyType values
            for (const [coffeePackId, testsForThisPack] of testsByPack.entries()) {
                // 3a) Compute overall averageScore for this pack
                let sumOfTestersTotals = 0;
                for (const oneTest of testsForThisPack) {
                    let singleTesterTotal = 0;
                    for (const prop of oneTest.userSampleProperties) {
                        singleTesterTotal += prop.intensity + prop.quality;
                    }
                    sumOfTestersTotals += singleTesterTotal;
                }

                // Divide by number of testers, then by propertyCount, then round
                const rawAveragePerTester =
                    sumOfTestersTotals / testsForThisPack.length;
                const overallAverageScore = Math.round(rawAveragePerTester / propertyCount);

                // 3b) Compute per‐PropertyType averages and chief’s value
                type AggResult = {
                    propertyType: PropertyType;
                    averageIntensity: number;
                    averageQuality: number;
                    chiefIntensity: number;
                    chiefQuality: number;
                    comments: string[]
                };

                const propertyResults: AggResult[] = [];
                const allPropertyTypes: PropertyType[] = [
                    PropertyType.AROMA,
                    PropertyType.ACIDITY,
                    PropertyType.SWEETNESS,
                    PropertyType.BODY,
                    PropertyType.AFTERTASTE,
                ];

                const chiefTesting = testsForThisPack.find(
                    (t) => t.userId === chiefUserId,
                );

                for (const propType of allPropertyTypes) {
                    // Collect all SampleProperty entries of this propertyType
                    const matchingProps: SampleProperty[] = [];
                    for (const oneTest of testsForThisPack) {
                        for (const prop of oneTest.userSampleProperties) {
                            if (prop.propertyType === propType) {
                                matchingProps.push(prop);
                            }
                        }
                    }

                    let avgIntensity = 0;
                    let avgQuality = 0;
                    if (matchingProps.length > 0) {
                        const sumIntensity = matchingProps.reduce(
                            (acc, p) => acc + p.intensity,
                            0,
                        );
                        const sumQuality = matchingProps.reduce(
                            (acc, p) => acc + p.quality,
                            0,
                        );
                        avgIntensity = Math.round(sumIntensity / matchingProps.length);
                        avgQuality = Math.round(sumQuality / matchingProps.length);
                    }

                    let chiefIntensity = 0;
                    let chiefQuality = 0;
                    if (chiefTesting) {
                        const chiefProp = chiefTesting.userSampleProperties.find(
                            (p) => p.propertyType === propType,
                        );
                        if (chiefProp) {
                            chiefIntensity = chiefProp.intensity;
                            chiefQuality = chiefProp.quality;
                        }
                    }

                    const comments = matchingProps
                        .map((prop) => prop.comment)
                        .filter((c): c is string => !!c);

                    propertyResults.push({
                        propertyType: propType,
                        averageIntensity: avgIntensity,
                        averageQuality: avgQuality,
                        chiefIntensity,
                        chiefQuality,
                        comments
                    });
                }

                // STEP 4: Insert a new cuppingSampleTestingResult row
                await this.prisma.cuppingSampleTestingResult.create({
                    data: {
                        cupping: { connect: { id: cuppingId } },
                        coffeePack: { connect: { id: coffeePackId } },
                        averageScore: overallAverageScore,
                        cuppingSampleTestingPropertyResult: {
                            create: propertyResults.map((r) => ({
                                propertyType: r.propertyType,
                                averageIntensivityScore: r.averageIntensity,
                                averageQualityScore: r.averageQuality,
                                averageChiefIntensivityScore: r.chiefIntensity,
                                averageChiefQualityScore: r.chiefQuality,
                                comments: r.comments
                            })),
                        },
                    },
                });
            }
        } catch (error) {
            throw error;
        }
    }

    private shuffle(array: IGetCuppingSampleResponse[]): IGetCuppingSampleResponse[] {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}