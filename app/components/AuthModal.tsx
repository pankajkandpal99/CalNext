import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { signIn } from "../lib/auth";
import { GithubAuthButton, GoogleAuthButton } from "./SubmitButton";

const AuthModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Try for free</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader className="flex flex-row justify-center items-center gap-2">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="logo" fill className="object-contain" />
          </div>
          <h4 className="text-3xl font-semibold">
            Cal<span className="text-primary">Next</span>
          </h4>
        </DialogHeader>

        <div className="flex flex-col mt-5 gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
            className="w-full"
          >
            <GoogleAuthButton />
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
            className="w-full"
          >
            <GithubAuthButton />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
