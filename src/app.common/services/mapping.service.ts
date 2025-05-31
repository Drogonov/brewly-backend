import { Injectable } from '@nestjs/common';
import {
    User,
    Company,
    UserToCompanyRelation,
    Role,
    Friendship,
    TeamInvitation,
    CuppingInvitation,
    Cupping,
    CuppingSettings,
    CuppingType,
    PropertyType,
    CoffeePack,
    SampleProperty,
    SampleTesting,
    SampleType,
    CuppingSampleTestingResult,
    CuppingSampleTestingPropertyResult,
} from '@prisma/client';
import {
    IUserInfoResponse,
    ICompanyInfoResponse,
    UserRole,
} from 'src/app.common/dto';
import {
    IGetUserSendedRequestResponse,
    RequestTypeEnum,
    IGetUserNotificationResponse,
    UserNotificationType
} from 'src/app.modules/user/dto';
import { LocalizationOptionsList } from '../localization/localization-options-list/localization-options-list.model';
import { IOptionListResponse } from '../dto/option-list.response.dto';
import { CuppingStatus, ICuppingResponse, IGetCuppingSampleResponse, IGetCuppingSampleTest, TestType } from 'src/app.modules/cupping/dto';

/**
 * This service centralizes mapping logic so that transformations
 * from Prisma models to DTOs are available across your application.
 * 
 * Moving these functions to a common folder (like app.common) is a good idea,
 * as it allows reuse in multiple services and ensures consistency.
 */

// TODO: - Add Localization service here
@Injectable()
export class MappingService {
    /**
     * Maps a Prisma User to an IUserInfoResponse.
     * Optionally, you can supply a role; otherwise, it defaults to "barista".
     */
    mapUser(user: User, role?: UserRole): IUserInfoResponse {
        return {
            userId: user.id,
            userName: user.userName,
            userImageURL: user.userImageURL,
            email: user.email,
            role: role,
            about: user.about,
        };
    }

    /**
     * Converts a Prisma Role into your application's UserRole.
     */
    mapRole(role: Role): UserRole {
        switch (role) {
            case Role.OWNER:
                return UserRole.owner;
            case Role.CHIEF:
                return UserRole.chief;
            case Role.BARISTA:
            default:
                return UserRole.barista;
        }
    }

    /**
     * Maps a Prisma Company (with its related users) to an ICompanyInfoResponse.
     */
    mapCompany(
        company: Company & { relatedToUsers: UserToCompanyRelation[] }
    ): ICompanyInfoResponse {
        const ownerRelation = company.relatedToUsers.find(
            (relation) => relation.role === Role.OWNER
        );
        return {
            companyId: company.id,
            ownerId: ownerRelation ? ownerRelation.userId : null,
            companyName: company.companyName,
            companyImageURL: company.companyImageURL,
            isPersonal: company.isPersonal
        };
    }

    /**
     * Maps a Prisma Friendship record to a sent-request DTO.
     * The "receiver" user is passed in to include user-specific data.
     */
    mapFriendRequest(
        friendship: Friendship,
        receiver: User
    ): IGetUserSendedRequestResponse {
        return {
            requestId: friendship.id,
            requestDate: friendship.createdAt.toISOString(),
            description: `Friend request to ${receiver.userName}`,
            type: RequestTypeEnum.FRIEND,
        };
    }

    /**
     * Maps a Prisma TeamInvitation record to a sent-request DTO.
     * The "receiver" user is passed in to include user-specific data.
     */
    mapTeamInvitation(
        invitation: TeamInvitation,
        receiver: User
    ): IGetUserSendedRequestResponse {
        return {
            requestId: invitation.id,
            requestDate: invitation.createdAt.toISOString(),
            description: `Team invitation to ${receiver.userName}`,
            type: RequestTypeEnum.TEAM,
        };
    }

    /**
     * Maps a friendship record into a notification DTO.
     * The sender user is passed to extract sender details.
     */
    mapFriendRequestNotification(
        friendship: Friendship,
        sender: User
    ): IGetUserNotificationResponse {
        return {
            notificationId: friendship.id,
            notificationDate: friendship.createdAt.toISOString(),
            iconName: 'person',
            description: `Friend request from ${sender.userName}`,
            type: UserNotificationType.friendRequest,
            senderId: sender.id,
            wasLoadedByReceiver: friendship.wasLoadedByReceiver
        };
    }

    /**
     * Maps a team invitation record into a notification DTO.
     * The sender user is passed to extract sender details.
     */
    mapTeamInvitationNotification(
        invitation: TeamInvitation,
        sender: User
    ): IGetUserNotificationResponse {
        return {
            notificationId: invitation.id,
            notificationDate: invitation.createdAt.toISOString(),
            iconName: 'group',
            description: `Team invitation from ${sender.userName}`,
            type: UserNotificationType.teamInvitation,
            senderId: sender.id,
            wasLoadedByReceiver: invitation.wasLoadedByReceiver
        };
    }

    mapCuppingInvitationNotification(
        invitation: CuppingInvitation,
        cupping: Cupping
    ): IGetUserNotificationResponse {
        return {
            notificationId: invitation.id,
            notificationDate: invitation.createdAt.toISOString(),
            iconName: 'cup.and.heat.waves.fill',
            description: `You’ve been invited to cupping “${cupping.cuppingName}”`,
            type: UserNotificationType.cuppingInvitation,
            senderId: cupping.cuppingCreatorId,
            cuppingId: cupping.id,
            wasLoadedByReceiver: invitation.wasLoadedByReceiver,
        }
    }

    /**
     * Maps OptionList from Model to DTO.
     */
    mapOptionList(
        optionList: LocalizationOptionsList
    ): IOptionListResponse {
        return {
            type: optionList.type,
            currentOption: optionList.currentOption,
            options: optionList.options
        }
    }

    /**
    * Map Prisma’s Cupping + its Settings to ICuppingResponse
    */

    mapCupping(
        cupping: Cupping & { settings: CuppingSettings },
        hasUserEndTesting: boolean
    ): ICuppingResponse {
        return {
            id: cupping.id,
            title: cupping.cuppingName,
            creationDate: cupping.createdAt.toISOString(),
            eventDate: cupping.eventDate?.toISOString() ?? null,
            status: this.translateTypeToStatus(cupping.cuppingType, hasUserEndTesting),
        };
    }

    translateTypeToStatus(type: CuppingType, hasUserEndTesting: boolean): CuppingStatus {
        switch (type) {
            case CuppingType.CREATED:
                return CuppingStatus.planned;
            case CuppingType.STARTED:
                if (hasUserEndTesting) {
                    return CuppingStatus.doneByCurrentUser;
                } else {
                    return CuppingStatus.inProgress;
                }
            case CuppingType.ARCHIVED:
                return CuppingStatus.ended;
            default:
                return CuppingStatus.planned;
        }
    }

    translateStatusToType(status: CuppingStatus): CuppingType {
        switch (status) {
            case CuppingStatus.planned:
                return CuppingType.CREATED;
            case CuppingStatus.inProgress:
                return CuppingType.STARTED;
            case CuppingStatus.doneByCurrentUser:
                return CuppingType.STARTED;
            case CuppingStatus.ended:
                return CuppingType.ARCHIVED;
        }
    }

    translatePropertyToTestType(propertyType: PropertyType): TestType {
        switch (propertyType) {
            case PropertyType.AROMA:
                return TestType.aroma;
            case PropertyType.ACIDITY:
                return TestType.acidity;
            case PropertyType.SWEETNESS:
                return TestType.sweetness;
            case PropertyType.BODY:
                return TestType.body;
            case PropertyType.AFTERTASTE:
                return TestType.aftertaste;
            default:
                return null
        }
    }

    translateTestToPropertyType(testType: TestType): PropertyType {
        switch (testType) {
            case TestType.aroma:
                return PropertyType.AROMA;
            case TestType.acidity:
                return PropertyType.ACIDITY;
            case TestType.sweetness:
                return PropertyType.SWEETNESS;
            case TestType.body:
                return PropertyType.BODY;
            case TestType.aftertaste:
                return PropertyType.AFTERTASTE;
            default:
                return null
        }
    }

    mapCuppingSamples(
        cupping: Cupping & {
            coffeePacks: Array<CoffeePack & { sampleType: SampleType }>;
            cuppingHiddenPackNames: { coffeePackId: number; coffeePackName: string }[];
            sampleTestings: Array<SampleTesting & { userSampleProperties: SampleProperty[] }>;
            cuppingResult?: CuppingSampleTestingResult & { cuppingSampleTestingPropertyResult: CuppingSampleTestingPropertyResult[] };
        },
        currentUserId: number
    ): IGetCuppingSampleResponse[] {
        console.log(cupping);

        // 1) Build a hidden-name lookup (packId → hiddenSampleName)
        const hiddenNameMap = new Map<number, string>(
            cupping.cuppingHiddenPackNames.map(h => [h.coffeePackId, h.coffeePackName])
        );

        // 2) Index individual SampleTesting (per user) by packId
        const testsByPack = new Map<
            number,
            SampleTesting & { userSampleProperties: SampleProperty[] }
        >();
        for (const testing of cupping.sampleTestings) {
            testsByPack.set(testing.coffeePackId, testing);
        }

        // 3) If the cupping has ended, index the aggregated result by packId
        //    (note: cupping.cuppingResult uses a unique constraint on cuppingId,
        //     but we still check coffeePackId to match each pack).
        let aggregatedByPack = new Map<number, CuppingSampleTestingPropertyResult[]>();
        if (cupping.cuppingResult) {
            // The schema ensures: cuppingResult.coffeePackId is unique per cupping.
            const packId = cupping.cuppingResult.coffeePackId;
            const props = cupping.cuppingResult.cuppingSampleTestingPropertyResult;
            aggregatedByPack.set(packId, props);
        }

        // 4) Finally, map each CoffeePack → IGetCuppingSampleResponse
        return cupping.coffeePacks.map(pack => {
            // a) Base sample info (independent of test results)
            const base: IGetCuppingSampleResponse = {
                sampleTypeId: pack.sampleTypeId,
                hiddenSampleName: hiddenNameMap.get(pack.id) || null,
                companyName: pack.sampleType.originCompanyName,
                sampleName: pack.sampleType.sampleName,
                beanOrigin: null,
                procecingMethod: null,
                roastType: pack.sampleType.roastType,
                grindType: pack.sampleType.grindType,
                packId: pack.id,
                roastDate: pack.roastDate.toISOString(),
                openDate: pack.openDate?.toISOString() ?? null,
                weight: pack.weight,
                barCode: pack.barCode,
                test: [], // we will fill this next
            };

            // b) If the cupping is still in progress → map the **current user’s** individual properties
            if (!cupping.cuppingResult) {
                const individualTesting = testsByPack.get(pack.id);
                if (individualTesting) {
                    base.test = individualTesting.userSampleProperties.map(prop => ({
                        type: this.translatePropertyToTestType(prop.propertyType),
                        intensivityUserRate: prop.intensity,
                        qualityUserRate: prop.quality,
                        commentUser: prop.comment,
                    }));
                }

                // c) If the cupping has ended → map the aggregated PropertyResult rows
            } else {
                const aggregatedProps = aggregatedByPack.get(pack.id) || [];
                base.averageScore = cupping.cuppingResult.averageScore;
                base.test = aggregatedProps.map(r => ({
                    type: this.translatePropertyToTestType(r.propertyType),
                    // these fields come from CuppingSampleTestingPropertyResult
                    intensivityAverageRate: r.averageIntensivityScore,
                    intensivityChiefRate: r.averageChiefIntensivityScore,
                    qualityAverageRate: r.averageQualityScore,
                    qualityChiefRate: r.averageChiefQualityScore,
                    // (optional) you could populate commentUsers or commentUser if you have that data somewhere,
                    // but since the aggregated results don’t include “comment” fields in the schema, we leave them undefined.
                }));
            }

            console.log("DEBUG: mapCuppingSamples");
            console.log(base);

            return base;
        });
    }
}