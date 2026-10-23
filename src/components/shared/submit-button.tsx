"use client";

import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFormPending } from "@/components/shared/action-form";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({ children, disabled, ...buttonProps }: SubmitButtonProps) {
  const isPending = useFormPending();

  return (
    <Button type="submit" disabled={isPending || disabled} {...buttonProps}>
      {isPending && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
