import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold">Welcome to Claw Shield</h1>
        <p className="text-lg text-muted-foreground">
          Secure authentication system with agent architecture
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
