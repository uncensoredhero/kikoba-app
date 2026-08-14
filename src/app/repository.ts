import { prisma } from "./prisma.js";

export const userRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findByUsername: (username: string) => prisma.user.findUnique({ where: { username } }),
  create: (data: { name: string; email: string; username: string }) =>
    prisma.user.create({ data }),
  updateProfile: (id: string, data: { username?: string; name?: string; profilePhotoUrl?: string | null }) =>
    prisma.user.update({ where: { id }, data }),
};

export const chamaRepository = {
  findById: (id: string) =>
    prisma.chama.findUnique({
      where: { id },
      include: { members: { include: { user: true } }, conversation: true },
    }),
  list: () =>
    prisma.chama.findMany({
      where: { status: "ACTIVE" },
      include: { members: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
};

export const friendRepository = {
  acceptedForUser: async (userId: string) => {
    const rows = await prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: { userA: true, userB: true },
    });
    return rows.map((row) => (row.userAId === userId ? row.userB : row.userA));
  },
};

export const messageRepository = {
  recentForChama: async (chamaId: string, take = 50) => {
    const conversation = await prisma.conversation.findUnique({ where: { chamaId } });
    if (!conversation) return [];
    return prisma.message.findMany({
      where: { conversationId: conversation.id },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take,
    });
  },
};
