import Image from "next/image";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  return (
    <div className="flex py-5 items-center justify-between">
      <Link href="/" className="flex gap-2 items-center">
        <div className="relative w-10 h-10">
          <Image src="/logo.png" alt="logo" fill className="object-contain" />
        </div>
        <h4 className="text-3xl font-semibold">
          Cal<span className="text-blue-500">Next</span>
        </h4>
      </Link>

      <div className="hidden md:flex md:justify-end md:space-x-4">
        <ThemeToggle />
        <AuthModal />
      </div>
    </div>
  );
};

export default Navbar;
