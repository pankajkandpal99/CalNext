"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from "react-dom";
import { OnboardingAction } from "../actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { onboardingSchema } from "../lib/zodSchemas";
import { SubmitButton } from "../components/SubmitButton";

const OnboardingRoute = () => {
  const [lastResult, action] = useFormState(OnboardingAction, undefined);

  const [form, fields] = useForm({
    lastResult, // Ye wo result hai jo pehle ki form submission ya action se aata hai.
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: onboardingSchema,
      });
    },

    shouldValidate: "onBlur", // Ye specify karta hai ki validation kab honi chahiye. Yahan onBlur diya gaya hai, iska matlab jab form ke kisi field ko focus karne ke baad us field ko blur (unfocus) kiya jaata hai, tab validation run hoti hai.
    shouldRevalidate: "onInput", // Ye batata hai ki field ka value change hone par validation firse run karna chahiye ya nahi. Yahan onInput diya gaya hai, iska matlab jab user input field mein kuch type karta hai (input field mein koi bhi change hota hai), tab validation firse trigger hoti hai.
  });

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome to Cal<span className="text-primary">Next</span>
          </CardTitle>
          <CardDescription>
            We need the following information to set up your profile!
          </CardDescription>
        </CardHeader>

        <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
          <CardContent className="flex flex-col gap-y-5">
            <div className="grid gap-y-2">
              <Label>Full Name</Label>
              <Input
                name={fields.fullName.name}
                defaultValue={fields.fullName.initialValue}
                key={fields.fullName.key}
                placeholder="John Marshal"
              />
              <p className="text-red-500 text-sm">{fields.fullName.errors}</p>
            </div>

            <div className="grid gap-y-2">
              <Label>Username</Label>
              <div className="flex rounded-md">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted bg-muted text-sm text-muted-foreground">
                  CalNext.com
                </span>

                <Input
                  placeholder="example-user-1"
                  className="rounded-l-none"
                  name={fields.userName.name}
                  defaultValue={fields.userName.initialValue}
                  key={fields.userName.key}
                />
              </div>
              <p className="text-red-500 text-sm">{fields.userName.errors}</p>
            </div>
          </CardContent>

          <CardFooter>
            <SubmitButton text="Submit" className="w-full text-white" />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingRoute;
