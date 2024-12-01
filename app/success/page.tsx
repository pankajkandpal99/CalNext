import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const SuccessRoute = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Card className="max-w-[400px] w-full mx-auto">
        <CardContent className="p-6 flex flex-col w-full items-center">
          <div className="size-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <Check className="size-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold mt-4">
            This event is scheduled
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            We emailed you a calendar invitation with all the details and the
            cideo call link!
          </p>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Close this Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SuccessRoute;
