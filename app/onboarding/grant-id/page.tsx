import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VideoGif from "@/public/work-is-almost-over-happy.gif";
import { CalendarCheck2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const OnboardingRouteTwo = () => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>You are almost done!</CardTitle>
          <CardDescription>
            We have to now connect your calendar to your account.
          </CardDescription>

          <Image
            src={VideoGif}
            alt="Almost finished gif"
            className="w-full rounded-md"
          />
        </CardHeader>

        <CardContent>
          <Button asChild className="w-full">
            <Link href="/api/auth">
              <CalendarCheck2 className="size-4 mr-0" />
              Connect Calendar to your Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingRouteTwo;