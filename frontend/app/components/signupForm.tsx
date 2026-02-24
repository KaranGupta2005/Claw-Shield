"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    chronotype: "neutral" as "morning" | "evening" | "neutral",
    soundSensitivity: 5,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error on input change
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("All fields are required");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setError("");
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await signup(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Create your account";
      case 2:
        return "Personalize your experience";
      case 3:
        return "Review & confirm";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Let's get started with the basics";
      case 2:
        return "Help us tailor your experience";
      case 3:
        return "Everything looks good?";
      default:
        return "";
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {getStepTitle()}
            </CardTitle>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-8 rounded-full transition-all duration-300",
                    i === step
                      ? "bg-primary"
                      : i < step
                      ? "bg-primary/50"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <CardDescription className="text-base">
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-sm p-3 mb-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-1 duration-300">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm p-3 mb-4 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-900 animate-in fade-in slide-in-from-top-1 duration-300">
              <span>Account created! Welcome aboard 🎉</span>
            </div>
          )}

          {/* STEP 1 - Personal Info */}
          {step === 1 && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 - Preferences */}
          {step === 2 && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Chronotype</Label>
                <Select
                  onValueChange={(val) => handleChange("chronotype", val)}
                  value={formData.chronotype}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning Person</SelectItem>
                    <SelectItem value="evening">Night Owl</SelectItem>
                    <SelectItem value="neutral">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  When are you most productive?
                </p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="soundSensitivity" className="text-sm font-medium">
                    Sound Sensitivity
                  </Label>
                  <span className="text-sm font-semibold text-primary">
                    {formData.soundSensitivity}/10
                  </span>
                </div>
                <input
                  id="soundSensitivity"
                  type="range"
                  min="0"
                  max="10"
                  value={formData.soundSensitivity}
                  onChange={(e) =>
                    handleChange("soundSensitivity", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  How sensitive are you to audio stimuli?
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 - Review */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Chronotype</span>
                  <span className="font-medium capitalize">
                    {formData.chronotype === "morning"
                      ? "Morning Person"
                      : formData.chronotype === "evening"
                      ? "Night Owl"
                      : "Flexible"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">
                    Sound Sensitivity
                  </span>
                  <span className="font-medium">{formData.soundSensitivity}/10</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={loading || success}
              className="h-11"
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="h-11 ml-auto transition-all duration-200">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || success}
              className="h-11 ml-auto transition-all duration-200"
            >
              {loading ? (
                "Creating..."
              ) : success ? (
                "Success!"
              ) : (
                "Create Account"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-primary font-medium hover:underline underline-offset-4"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
