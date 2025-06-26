import { PrismaClient, Prisma } from '@prisma/client';

export const softDeleteUserExtension = {
    model: {
        user: {
            findUnique(original: any, args: Prisma.UserFindUniqueArgs) {
                return original({
                    ...args,
                    where: {
                        AND: [
                            args.where,
                            { deletedAt: null },
                        ],
                    },
                });
            },
            findFirst(original: any, args: Prisma.UserFindFirstArgs) {
                return original({
                    ...args,
                    where: {
                        AND: [
                            args.where ?? {},
                            { deletedAt: null },
                        ],
                    },
                });
            },
            findMany(original: any, args: Prisma.UserFindManyArgs) {
                return original({
                    ...args,
                    where: {
                        AND: [
                            args.where ?? {},
                            { deletedAt: null },
                        ],
                    },
                });
            },
        },
    },
};