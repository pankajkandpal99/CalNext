// "use client";
import { Button } from "@/components/ui/button";
import { AriaButtonProps, useButton } from "@react-aria/button";
import { CalendarState } from "@react-stately/calendar";
import { mergeProps } from "@react-aria/utils";
import { useFocusRing } from "@react-aria/focus";
import { useRef } from "react";

export const CalendarButton = (
  props: AriaButtonProps<"button"> & {
    state?: CalendarState;
    side?: "left" | "right";
  }
) => {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps } = useFocusRing();

  return (
    <Button
      variant="outline"
      size="icon"
      ref={ref}
      disabled={props.isDisabled}
      {...mergeProps(buttonProps, focusProps)}
    >
      {props.children}
    </Button>
  );
};
