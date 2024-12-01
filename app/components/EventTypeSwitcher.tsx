"use client";
import { Switch } from "@/components/ui/switch";
import { UpdateEventTypeStatusAction } from "../actions";
import { useFormState } from "react-dom";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

const MenuActiveSwitch = ({
  initialChecked,
  eventTypeId,
}: {
  initialChecked: boolean;
  eventTypeId: string;
}) => {
  const [isPending, startTransition] = useTransition(); // useTransition ek hook hai jo React me asynchronous state updates ko manage karne ke liye use hota hai. Iska kaam hai UI responsiveness ko maintain karte hue low-priority updates ko delay ya smoothly handle karna.
  const [state, action] = useFormState(UpdateEventTypeStatusAction, undefined);

  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message);
    } else if (state?.status === "error") {
      toast.error(state?.message);
    }
  }, [state]);

  return (
    <Switch
      disabled={isPending}
      defaultChecked={initialChecked}
      onCheckedChange={(isChecked) => {
        startTransition(() => {
          // StartTransition ek function hai jo low-priority work ko asynchronously handle karta hai, without blocking high-priority updates. startTransition ensures the UI toggle is smooth and responsive without waiting for the action to complete.
          action({
            eventTypeId: eventTypeId,
            isChecked: isChecked,
          });
        });
      }}
    />
  );
};

export default MenuActiveSwitch;

/*
Using of useTransition -> 
    High-priority work:

    UI toggles the switch immediately.
    Low-priority work:

    The action() function, which might:
    Update the backend.
    Update a global state.
    Re-render other components based on the state change.

Without startTransition, if the action() takes 1-2 seconds (due to a slow network/API), the UI might appear frozen. But with useTransition, users experience an immediate response, and backend work happens smoothly in the background.
*/
