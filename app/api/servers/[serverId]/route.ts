import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const membersToDelete = await db.member.findMany({
      where: {
        serverId: params.serverId,
      },
    });

    // Delete members
    await Promise.all(
      membersToDelete.map(async (member) => {
        await db.member.delete({
          where: {
            id: member.id,
          },
        });
      })
    );

    const channelsToDelete = await db.channel.findMany({
      where: {
        serverId: params.serverId,
      },
    });

    // Delete channels
    await Promise.all(
      channelsToDelete.map(async (channel) => {
        await db.channel.delete({
          where: {
            id: channel.id,
          },
        });
      })
    );

    // Now, delete the server
    await db.server.delete({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
    });

    return NextResponse.json(null);
  } catch (error: any) {
    console.log("[SERVER_ID_DELETE]", error);
    return new NextResponse(`Internal Error: ${error.message}`, {
      status: 500,
    });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, imageUrl } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
