import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import InitialModel from "@/components/models/initial-model";

interface Member {
  profileId: string;
  // Other member properties...
}

interface Server {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: Member[]; // Make members optional if it's not always present
}

const SetupPage = async () => {
  const profile = await initialProfile();

  const servers = await db.server.findMany({
    where: {},
    include: {
      members: true,
    },
  });

  const latestServerWithProfile = servers.reduce(
    (latest: Server | null, current: Server) => {
      // Check if 'members' property exists on 'current' object
      if (current.members) {
        const hasMatchingMember = current.members.some(
          (member: Member) => member.profileId === profile.id
        );

        if (
          hasMatchingMember &&
          (!latest || current.createdAt > latest.createdAt)
        ) {
          return current;
        }
      }

      return latest;
    },
    null
  );

  if (latestServerWithProfile) {
    return redirect(`/servers/${latestServerWithProfile?.id}`);
  }

  return <InitialModel />;
};

export default SetupPage;
