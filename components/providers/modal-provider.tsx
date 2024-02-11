"use client";

import { useEffect, useState } from "react";
import CreateServerModal from "@/components/models/create-server.modal";
import InviteModal from "@/components/models/invite-modal";
import EditServerModal from "@/components/models/edit-server.modal";
import MembersModal from "@/components/models/members-modal";
import CreateChannelModal from "@/components/models/create-channel-modal";
import LeaveServerModal from "@/components/models/leave-sever-modal";
import DeleteServerModal from "@/components/models/delete-sever-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
    </>
  );
};
