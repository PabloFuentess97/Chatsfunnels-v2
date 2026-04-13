import prisma from "@/lib/prisma";

export async function createGroup(
  ownerId: string,
  data: { name: string; maxMembers?: number }
) {
  return prisma.group.create({
    data: {
      name: data.name,
      ownerId,
      maxMembers: data.maxMembers || 50,
    },
  });
}

export async function addMemberToGroup(
  groupId: string,
  userId: string,
  linkUrl: string
) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });

  if (!group) throw new Error("Group not found");
  if (group._count.members >= group.maxMembers) {
    throw new Error("Group is full");
  }

  return prisma.groupMember.create({
    data: { groupId, userId, linkUrl },
  });
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  return prisma.groupMember.deleteMany({
    where: { groupId, userId },
  });
}

export async function startRound(groupId: string, maxClicks: number) {
  // Complete any active rounds first
  await prisma.round.updateMany({
    where: { groupId, status: "ACTIVE" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  // Get the last round number
  const lastRound = await prisma.round.findFirst({
    where: { groupId },
    orderBy: { roundNumber: "desc" },
  });

  return prisma.round.create({
    data: {
      groupId,
      roundNumber: (lastRound?.roundNumber || 0) + 1,
      maxClicks,
      status: "ACTIVE",
    },
  });
}

export async function checkAndRotateRound(groupId: string) {
  const activeRound = await prisma.round.findFirst({
    where: { groupId, status: "ACTIVE" },
  });

  if (!activeRound) return null;

  if (activeRound.clicksDistributed >= activeRound.maxClicks) {
    // Complete this round and start a new one
    await prisma.round.update({
      where: { id: activeRound.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return startRound(groupId, activeRound.maxClicks);
  }

  return activeRound;
}

export async function distributeGroupTraffic(groupId: string) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    orderBy: { joinedAt: "asc" },
  });

  if (members.length === 0) return null;

  const activeRound = await prisma.round.findFirst({
    where: { groupId, status: "ACTIVE" },
  });

  if (!activeRound) return null;

  // Find the member with the least relative traffic in this round
  const clicksPerMember = Math.floor(
    activeRound.clicksDistributed / members.length
  );
  const remainder = activeRound.clicksDistributed % members.length;

  // The next member to receive traffic is based on round-robin
  const nextMemberIndex =
    activeRound.clicksDistributed % members.length;

  const selectedMember = members[nextMemberIndex];

  // Increment clicks distributed
  await prisma.round.update({
    where: { id: activeRound.id },
    data: { clicksDistributed: { increment: 1 } },
  });

  // Check if round should rotate
  await checkAndRotateRound(groupId);

  return selectedMember;
}

export async function getGroupWithMembers(groupId: string) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      rounds: { orderBy: { roundNumber: "desc" }, take: 5 },
      _count: { select: { members: true } },
    },
  });
}

export async function getUserGroups(userId: string) {
  return prisma.group.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      _count: { select: { members: true } },
      rounds: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
