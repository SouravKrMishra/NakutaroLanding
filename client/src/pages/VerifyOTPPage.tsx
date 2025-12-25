import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/AuthContext.tsx";
import { buildApiUrl } from "@/lib/api.ts";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // Start with 60 seconds countdown
  const [resendAttempts, setResendAttempts] = useState(0); // Track resend attempts
  const MAX_RESEND_ATTEMPTS = 3;
  const [, setLocation] = useLocation();
  const { setUserData } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Get email from URL params and set initial countdown
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      // Set initial countdown when page loads (60 seconds)
      setCountdown(60);
    } else {
      // If no email in URL, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        errorRef.current.focus?.();
      }
    }, 0);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        if (digits.length === 6) {
          const newOtp = [...otp];
          digits.forEach((digit, i) => {
            if (i < 6) {
              newOtp[i] = digit;
            }
          });
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      showError("Please enter the complete 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/auth/verify-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Email verified successfully! Redirecting to dashboard...");
        setUserData(data.user, data.token);

        // Trigger cart refresh for multi-device sync
        window.dispatchEvent(
          new CustomEvent("userLogin", {
            detail: { userId: data.user.id, timestamp: Date.now() },
          })
        );

        setTimeout(() => {
          setLocation("/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        showError(errorData.message || "Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      showError("An error occurred. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email || resendAttempts >= MAX_RESEND_ATTEMPTS)
      return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(buildApiUrl("/api/auth/resend-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (response.ok) {
        const newAttempts = resendAttempts + 1;
        setResendAttempts(newAttempts);
        setSuccess("OTP has been resent to your email address.");
        setOtp(["", "", "", "", "", ""]);
        setCountdown(60); // 60 second countdown
        inputRefs.current[0]?.focus();
      } else {
        const errorData = await response.json();
        showError(
          errorData.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (err) {
      showError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getPreviousPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get("from");
    return from || "/";
  };

  const handleBackClick = () => {
    setLocation(getPreviousPage());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold text-white text-center">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              We've sent a 6-digit verification code to
            </CardDescription>
            {email && (
              <div className="flex items-center justify-center gap-2 text-accent">
                <Mail className="h-4 w-4" />
                <span className="font-medium">{email}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4" ref={errorRef}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-900/50 border-green-700">
                <AlertDescription className="text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white text-center block">
                  Enter Verification Code
                </Label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-700 border-gray-600 text-white focus:border-accent focus:ring-accent"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/80 text-white"
                disabled={isLoading || otp.join("").length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">
                  Didn't receive the code?
                </p>
                {resendAttempts >= MAX_RESEND_ATTEMPTS ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-400">
                      Maximum resend attempts reached. Please contact support or
                      try again later.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="text-gray-500 border-gray-600 cursor-not-allowed"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend OTP (Disabled)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resendAttempts > 0 && (
                      <p className="text-xs text-gray-500">
                        Resend attempts: {resendAttempts}/{MAX_RESEND_ATTEMPTS}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendOTP}
                      disabled={
                        isResending ||
                        countdown > 0 ||
                        resendAttempts >= MAX_RESEND_ATTEMPTS
                      }
                      className="text-accent border-accent hover:bg-accent/10 hover:text-accent disabled:text-gray-500 disabled:border-gray-600"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        `Resend OTP (${countdown}s)`
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend OTP
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
