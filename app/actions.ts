"use server";
import prisma from "./lib/db";
import { requireUser } from "./lib/hooks";
import { parseWithZod } from "@conform-to/zod";
import {
  eventTypeSchema,
  onboardingSchemaValidation,
  settingsSchema,
} from "./lib/zodSchemas";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nylas } from "./lib/nylas";

// server-side validation with serm submission using server actions.
export const OnboardingAction = async (prevState: any, formData: FormData) => {
  const session = await requireUser(); // get the loggedIn user data

  const submission = await parseWithZod(formData, {
    schema: onboardingSchemaValidation({
      async isUserNameUnique() {
        const existingUsername = await prisma.user.findUnique({
          where: { userName: formData.get("userName") as string },
        });

        return !existingUsername;
      },
    }),

    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.user.update({
    where: {
      id: session.user?.id,
    },

    data: {
      userName: submission.value.userName,
      name: submission.value.fullName,
      availability: {
        createMany: {
          data: [
            {
              day: "Monday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Tuesday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Wednesday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Thursday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Friday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Saturday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Sunday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
          ],
        },
      },
    },
  });

  return redirect("/onboarding/grant-id");
};

export const SettingsAction = async (prevState: any, formData: FormData) => {
  const session = await requireUser();
  const submission = parseWithZod(formData, {
    schema: settingsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const user = await prisma.user.update({
    where: { id: session.user?.id as string },
    data: {
      name: submission.value.fullName,
      image: submission.value.profileImage,
    },
  });

  return redirect("/dashboard");
};

export const UpdateAvailabilityAction = async (formData: FormData) => {
  const session = await requireUser();

  const rawData = Object.fromEntries(formData.entries());

  const availabilityData = Object.keys(rawData)
    .filter((key) => key.startsWith("id-"))
    .map((key) => {
      const id = key.replace("id-", ""); // remove the id string from input field inside name value...
      const fromTime = rawData[`fromTime-${id}`] as string;
      const tillTime = rawData[`tillTime-${id}`] as string;

      if (!fromTime || !tillTime || !id) {
        console.error(`Invalid data for ID: ${id}`);
        return null;
      }

      return {
        id,
        isActive: rawData[`isActive-${id}`] === "on", // here "on" is represents the true/false.
        fromTime,
        tillTime,
      };
    })
    .filter(Boolean); // Remove null entries

  if (availabilityData.length === 0) {
    console.error("No data provided for update");
    return;
  }

  // Prisma.$transaction() Prisma ORM ka ek method hai. Iska kaam database operations ko ek transaction ke roop me execute karna hota hai, jisme multiple queries ko ek atomic block me bundle kiya ja sakta hai. Agar transaction ka koi bhi ek part fail hota hai, to pura transaction rollback ho jata hai, yani koi changes commit nahi hote.
  try {
    await prisma.$transaction(
      availabilityData.map((item) =>
        prisma.availability.update({
          where: {
            id: item!.id,
          },
          data: {
            isActive: item!.isActive,
            fromTime: item!.fromTime,
            tillTime: item!.tillTime,
          },
        })
      )
    );

    revalidatePath("/dashboard/availability"); // revalidatePath ka use tab hota hai jab aap server-side rendered (SSR) ya static site generation (SSG) content ko refresh ya revalidate karna chahte ho bina manually page reload kiye. Agar aapke kisi path (route) ka data change hota hai (jaise database me koi update), aur aap chahte ho ki wo updated data turant reflect ho frontend par, to aap revalidatePath ka use karte ho.
  } catch (error) {
    console.error("Error updating availability:", error);
  }
};

export const CreateEventTypeAction = async (
  prevState: any,
  formData: FormData
) => {
  const session = await requireUser();

  if (!session || !session.user?.id) {
    console.error("User is not authenticated");
    return;
  }

  const submission = parseWithZod(formData, {
    schema: eventTypeSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.eventType.create({
    data: {
      title: submission.value.title,
      duration: submission.value.duration,
      url: submission.value.url,
      description: submission.value.description,
      videoCallSoftware: submission.value.videoCallSoftware,
      userId: session.user?.id as string,
    },
  });

  // Redirect to the dashboard upon success
  return redirect("/dashboard");
};

export const CreateMeetingAction = async (formData: FormData) => {
  const getUserData = await prisma.user.findUnique({
    where: {
      userName: formData.get("username") as string,
    },
    select: {
      grantEmail: true,
      grantId: true,
    },
  });

  if (!getUserData) {
    throw new Error("User not found");
  }

  const eventTypeData = await prisma.eventType.findUnique({
    where: {
      id: formData.get("eventTypeId") as string,
    },
    select: {
      title: true,
      description: true,
    },
  });

  const fromTime = formData.get("fromTime") as string;
  const eventDate = formData.get("eventDate") as string;
  const meetingLength = Number(formData.get("meetingLength"));
  const provider = formData.get("provider") as string;

  const startDateTime = new Date(`${eventDate}T${fromTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + meetingLength * 60000); // we are trying to convert minutes to miliseconds...

  await nylas.events.create({
    identifier: getUserData.grantId as string,
    requestBody: {
      title: eventTypeData?.title,
      description: eventTypeData?.description,
      when: {
        startTime: Math.floor(startDateTime.getTime() / 1000),
        endTime: Math.floor(endDateTime.getTime() / 1000),
      },
      conferencing: {
        autocreate: {},
        provider: provider as any,
      },
      participants: [
        {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          status: "yes",
        },
      ],
    },
    queryParams: {
      calendarId: getUserData.grantEmail as string,
      notifyParticipants: true,
    },
  });

  return redirect("/success");
};

export const CancelMeetingAction = async (formData: FormData) => {
  const session = await requireUser();
  const userData = await prisma.user.findUnique({
    where: {
      id: session.user?.id,
    },
    select: {
      grantEmail: true,
      grantId: true,
    },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  const data = await nylas.events.destroy({
    eventId: formData.get("eventId") as string,
    identifier: userData.grantId as string,
    queryParams: {
      calendarId: userData.grantEmail as string,
    },
  });

  revalidatePath("/dashboard/meetings");
};

export const EditEventTypeAction = async (
  prevState: any,
  formData: FormData
) => {
  const session = await requireUser();

  const submission = await parseWithZod(formData, {
    schema: eventTypeSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.eventType.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },

    data: {
      title: submission.value.title,
      duration: submission.value.duration,
      url: submission.value.url,
      description: submission.value.description,
      videoCallSoftware: submission.value.videoCallSoftware,
    },
  });

  return redirect("/dashboard");
};

export const UpdateEventTypeStatusAction = async (
  prevState: any,
  {
    eventTypeId,
    isChecked,
  }: {
    eventTypeId: string;
    isChecked: boolean;
  }
) => {
  try {
    const session = await requireUser();
    const data = await prisma.eventType.update({
      where: {
        id: eventTypeId,
        userId: session.user?.id,
      },
      data: {
        active: isChecked,
      },
    });

    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Event Type Status updated!",
    };
  } catch (error) {
    console.error("Error occured while status update : ", error);
    return {
      status: "error",
      message: "Something went wrong!",
    };
  }
};

export const DeleteEventTypeAction = async (formData: FormData) => {
  const session = await requireUser();

  const data = await prisma.eventType.delete({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard");
};
