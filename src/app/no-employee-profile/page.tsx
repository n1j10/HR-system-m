import { UserXIcon } from "lucide-react";

import { MessagePage } from "@/components/shared/message-page";

export default function NoEmployeeProfilePage() {
  return (
    <MessagePage
      icon={UserXIcon}
      title="No employee profile yet"
      message="Your account is not linked to an employee record. Ask HR to add you as an employee using the same email you signed in with, or to link your account from Users & Roles."
    />
  );
}
