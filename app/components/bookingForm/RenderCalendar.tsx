"use client";
import { useEffect, useState } from "react";
import { Calendar } from "./Calendar";
import {
  today,
  getLocalTimeZone,
  DateValue,
  parseDate,
  CalendarDate,
} from "@internationalized/date";
import { useRouter, useSearchParams } from "next/navigation";

interface iAppProps {
  availability: {
    day: string;
    isActive: boolean;
  }[];
}

export const RenderCalendar = ({ availability }: iAppProps) => {
  // console.log("availability: ", availability);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(() => {
    const dateParam = searchParams.get("date");

    return dateParam ? parseDate(dateParam) : today(getLocalTimeZone());
  });

  const handleDateChange = (date: DateValue) => {
    setDate(date as CalendarDate);

    const url = new URL(window.location.href);
    url.searchParams.set("date", date.toString());
    router.push(url.toString());
  };

  const isDateUnavailable = (date: DateValue) => {
    const dayOfWeek = date.toDate(getLocalTimeZone()).getDay();
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return !availability[adjustedIndex].isActive; //availability ke andar jo date me false value hai ye use return karega.
  };

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      setDate(parseDate(dateParam));
    }
  }, [searchParams]);

  return (
    <Calendar
      minValue={today(getLocalTimeZone())}
      isDateUnavailable={isDateUnavailable}
      value={date}
      onChange={handleDateChange}
    />
  );
};
