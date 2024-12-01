import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .min(3, {
      message: "Full name must contain at least 3 characters",
    })
    .max(150, {
      message: "Full name must not exceed 150 characters",
    }),
  userName: z
    .string()
    .min(3, {
      message: "Username must contain at least 3 characters.",
    })
    .max(150, {
      message: "Username must not exceed 150 characters",
    })
    .regex(/^(?!-)[a-zA-Z0-9-_]+(?<!-)$/, {
      message:
        "Username can only contain letters, numbers, -, and _ but cannot start or end with -.",
    }),
});

export function onboardingSchemaValidation(options?: {
  isUserNameUnique: () => Promise<boolean>;
}) {
  return z.object({
    userName: z
      .string()
      .min(3)
      .max(150)
      .regex(/^(?!-)[a-zA-Z0-9-_]+(?<!-)$/, {
        message:
          "Username can only contain letters, numbers, -, and _ but cannot start or end with -.",
      })
      .pipe(
        z.string().superRefine((_, ctx) => {
          if (typeof options?.isUserNameUnique !== "function") {
            ctx.addIssue({
              code: "custom",
              message: conformZodMessage.VALIDATION_UNDEFINED,
              fatal: true,
            });
            return;
          }

          return options.isUserNameUnique().then((isUnique) => {
            if (!isUnique) {
              ctx.addIssue({
                code: "custom",
                message: "Username is already used",
              });
            }
          });
        })
      ),

    fullName: z.string().min(3).max(150),
  });
}

export const settingsSchema = z.object({
  fullName: z.string().min(3).max(150),
  profileImage: z.string(),
});

export const eventTypeSchema = z.object({
  title: z.string().min(3).max(150),
  duration: z.number().min(15).max(60),
  url: z.string().min(3).max(150),
  description: z.string().min(3).max(300),
  videoCallSoftware: z.string().min(3),
});
