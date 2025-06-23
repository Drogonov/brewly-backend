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
} from 'src/app/common/dto';
import {
    IGetUserSendedRequestResponse,
    RequestTypeEnum,
    IGetUserNotificationResponse,
    UserNotificationType
} from 'src/app/modules/user/dto';
import { LocalizationOptionsList } from '../localization/localization-options-list/localization-options-list.model';
import { IOptionListResponse } from '../dto/option-list.response.dto';
import { CuppingStatus, ICuppingResponse, IGetCuppingSampleResponse, IGetCuppingSampleTest, TestType } from 'src/app/modules/cupping/dto';

/**
 * This service centralizes mapping logic so that transformations
 * from Prisma models to DTOs are available across your application.
 * 
 * Moving these functions to a common folder (like app/common) is a good idea,
 * as it allows reuse in multiple services and ensures consistency.
 */

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
        localizedDescription: string
    ): IGetUserSendedRequestResponse {
        return {
            requestId: friendship.id,
            requestDate: friendship.createdAt.toISOString(),
            description: localizedDescription,
            type: RequestTypeEnum.FRIEND,
        };
    }

    /**
     * Maps a Prisma TeamInvitation record to a sent-request DTO.
     * The "receiver" user is passed in to include user-specific data.
     */
    mapTeamInvitation(
        invitation: TeamInvitation,
        localizedDescription: string
    ): IGetUserSendedRequestResponse {
        return {
            requestId: invitation.id,
            requestDate: invitation.createdAt.toISOString(),
            description: localizedDescription,
            type: RequestTypeEnum.TEAM,
        };
    }

    /**
     * Maps a friendship record into a notification DTO.
     * The sender user is passed to extract sender details.
     */
    mapFriendRequestNotification(
        friendship: Friendship,
        sender: User,
        iconName: string,
        localizedDescription: string
    ): IGetUserNotificationResponse {
        return {
            notificationId: friendship.id,
            notificationDate: friendship.createdAt.toISOString(),
            iconName: iconName,
            description: localizedDescription,
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
        sender: User,
        iconName: string,
        localizedDescription: string
    ): IGetUserNotificationResponse {
        return {
            notificationId: invitation.id,
            notificationDate: invitation.createdAt.toISOString(),
            iconName: iconName,
            description: localizedDescription,
            type: UserNotificationType.teamInvitation,
            senderId: sender.id,
            wasLoadedByReceiver: invitation.wasLoadedByReceiver
        };
    }

    mapCuppingInvitationNotification(
        invitation: CuppingInvitation,
        cupping: Cupping,
        iconName: string,
        localizedDescription: string
    ): IGetUserNotificationResponse {
        return {
            notificationId: invitation.id,
            notificationDate: invitation.createdAt.toISOString(),
            iconName: iconName,
            description: localizedDescription,
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
            cuppingResult: (CuppingSampleTestingResult & {
                cuppingSampleTestingPropertyResult: CuppingSampleTestingPropertyResult[];
            })[];
        },
        currentUserId: number,
    ): IGetCuppingSampleResponse[] {
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

        // 3) Index the aggregated results by coffeePackId
        const aggregatedByPack = new Map<
            number,
            CuppingSampleTestingPropertyResult[]
        >();
        for (const resultRow of cupping.cuppingResult || []) {
            aggregatedByPack.set(
                resultRow.coffeePackId,
                resultRow.cuppingSampleTestingPropertyResult
            );
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
                test: [],
            };

            // b) If the cupping has ended → map the aggregated PropertyResult rows
            if (cupping.cuppingResult && cupping.cuppingResult.length > 0) {
                const aggProps = aggregatedByPack.get(pack.id) || [];
                const individualTesting = testsByPack.get(pack.id);

                // find the matching CuppingSampleTestingResult to pull averageScore
                const thisResult = cupping.cuppingResult.find(r => r.coffeePackId === pack.id);
                base.averageScore = thisResult.averageScore
                base.test = aggProps.map(r => {
                    // find the current user's own property result (if any)
                    const userProp = individualTesting
                        ? individualTesting.userSampleProperties.find(p => p.propertyType === r.propertyType)
                        : undefined;

                    return {
                        type: this.translatePropertyToTestType(r.propertyType),
                        intensivityUserRate: userProp ? userProp.intensity : undefined,
                        intensivityAverageRate: r.averageIntensivityScore,
                        intensivityChiefRate: r.averageChiefIntensivityScore,
                        qualityUserRate: userProp ? userProp.quality : undefined,
                        qualityAverageRate: r.averageQualityScore,
                        qualityChiefRate: r.averageChiefQualityScore,
                        commentUser: userProp ? userProp.comment : undefined,
                        commentUsers: r.comments,
                    };
                });
            }
            // c) If the cupping is still in progress → map the current user’s individual properties
            else {
                const individualTesting = testsByPack.get(pack.id);
                if (individualTesting) {
                    base.test = individualTesting.userSampleProperties.map(prop => ({
                        type: this.translatePropertyToTestType(prop.propertyType),
                        intensivityUserRate: prop.intensity,
                        qualityUserRate: prop.quality,
                        commentUser: prop.comment,
                        intensivityAverageRate: undefined,
                        intensivityChiefRate: undefined,
                        qualityAverageRate: undefined,
                        qualityChiefRate: undefined,
                        commentUsers: undefined,
                    }));
                }
            }

            return base;
        });
    }
}