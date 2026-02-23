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
import { useAuth } from "../hooks/useAuth";

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
  };

  const handleNext = () => {
    // Validate step 1
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all fields");
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
      const response = await signup(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(response.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Step {step} of 3:{" "}
            {step === 1
              ? "Personal Info"
              : step === 2
              ? "Preferences"
              : "Review & Submit"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              ✅ Account created successfully! Redirecting...
            </div>
          )}

          {/* STEP 1 - Personal Info */}
          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password (min 6 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2 - Preferences */}
          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Chronotype</Label>
                <Select
                  onValueChange={(val) => handleChange("chronotype", val)}
                  value={formData.chronotype}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your chronotype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning Person (Early Bird)</SelectItem>
                    <SelectItem value="evening">Evening Person (Night Owl)</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your natural sleep-wake preference
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="soundSensitivity">
                  Sound Sensitivity: {formData.soundSensitivity}/10
                </Label>
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
            <div className="space-y-3 text-sm">
              <h3 className="font-semibold text-base mb-2">
                Please review your details:
              </h3>
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{formData.name}</span>
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{formData.email}</span>
                <span className="text-muted-foreground">Chronotype:</span>
                <span className="font-medium capitalize">
                  {formData.chronotype}
                </span>
                <span className="text-muted-foreground">Sound Sensitivity:</span>
                <span className="font-medium">
                  {formData.soundSensitivity}/10
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrev} disabled={loading}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Login
        </a>
      </div>
    </div>
  );
}
