import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server Id is Missing", { status: 400 });
    }

    const existingServer = await db.server.findUnique({
      where: {
        id: params.serverId,
        profileId: {
          not: profile.id,
        },
      },
      include: {
        members: true,
      },
    });
    const isProfileInMembers = existingServer?.members.some(
      (member) =>
        member.profileId === profile.id && member.role !== MemberRole.ADMIN
    );
    if (!isProfileInMembers) {
      return new NextResponse("Server does not exist", { status: 400 });
    }
    const updatedServer = await db.server.update({
      where: {
        id: params.serverId,
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile?.id,
          },
        },
      },
    });

    console.log(updatedServer);
    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("SERVER_ID_LEAVE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
