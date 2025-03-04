import { Injectable } from '@nestjs/common';
import {
    User,
    Company,
    UserToCompanyRelation,
    Role,
    Friendship,
    TeamInvitation,
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

/**
 * This service centralizes mapping logic so that transformations
 * from Prisma models to DTOs are available across your application.
 * 
 * Moving these functions to a common folder (like app.common) is a good idea,
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
            role: role ?? UserRole.barista,
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
        };
    }
}