"use client";

import { createContext, useActionState, useContext, useEffect, useRef, startTransition } from "react";
import { toast } from "sonner";

import { initialActionResult, type ActionResult } from "@/lib/action-result";

type FormAction = (previousResult: ActionResult, formData: FormData) => Promise<ActionResult>;

type ActionFormProps = {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  /** Clear the inputs after a successful submit. */
  resetOnSuccess?: boolean;
  /** When set, the browser asks the user to confirm before submitting. */
  confirmMessage?: string;
  onSuccess?: () => void;
};

const FormPendingContext = createContext(false);

/** Lets <SubmitButton /> know when the form is being submitted. */
export function useFormPending() {
  return useContext(FormPendingContext);
}

/**
 * A <form> that calls a server action and shows the result as a toast.
 * Every form in the app uses this, so success/error handling lives in one place.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  confirmMessage,
  onSuccess,
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, submitAction, isPending] = useActionState(action, initialActionResult);

  useEffect(() => {
    if (!result.message) return;

    if (result.success) {
      toast.success(result.message);
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.();
    } else {
      toast.error(result.message);
    }
    // We only want to react when a new result arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // We submit manually so React does not clear the inputs when there is an error.
    event.preventDefault();
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    const formData = new FormData(event.currentTarget);
    startTransition(() => submitAction(formData));
  }

  return (
    <FormPendingContext.Provider value={isPending}>
      <form ref={formRef} onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormPendingContext.Provider>
  );
}
