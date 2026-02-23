import { SignupForm } from "@/app/components/signupForm";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Header with Logo and Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <a href="/" aria-label="home" className="flex gap-2 items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>

      {/* Mode Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-border p-1">
          <ModeToggle />
        </div>
      </div>

      {/* Animated Background - Right Side (Desktop Only) */}
      <div className="bg-white dark:bg-muted relative hidden lg:block overflow-hidden">
        <GradientMesh
          colors={["#bcecf6", "#00aaff", "#ffd447"]}
          distortion={8}
          swirl={0.2}
          speed={1}
          rotation={90}
          waveAmp={0.2}
          waveFreq={20}
          waveSpeed={0.2}
          grain={0.06}
        />
      </div>
    </div>
  );
}
