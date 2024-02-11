import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const existingServer = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        members: true,
      },
    });

    if (!existingServer) {
      return new NextResponse("Server is not found", { status: 400 });
    }

    const isAuthorized = existingServer.members.some(
      (member) =>
        member.profileId === profile.id &&
        (member.role === MemberRole.ADMIN ||
          member.role === MemberRole.MODERATOR)
    );

    if (!isAuthorized) {
      console.log("UNAUTHORIZED");
      return new NextResponse("Internal Error", { status: 500 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
