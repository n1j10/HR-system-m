import { ShieldAlertIcon } from "lucide-react";

import { MessagePage } from "@/components/shared/message-page";

export default function UnauthorizedPage() {
  return (
    <MessagePage
      icon={ShieldAlertIcon}
      title="You don't have access"
      message="Your role does not allow you to open this page. Ask an administrator if you think this is a mistake."
    />
  );
}
