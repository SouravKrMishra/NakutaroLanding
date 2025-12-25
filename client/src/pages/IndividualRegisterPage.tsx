import React, { useState } from "react";
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
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useAuth } from "@/lib/AuthContext.tsx";
import { Eye, EyeOff, ArrowLeft, User } from "lucide-react";

const IndividualRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { isAuthenticated, isLoading: authLoading, setUserData } = useAuth();
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const getPreviousPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get("from");
    return from || "/";
  };

  const handleBackClick = () => {
    setLocation(getPreviousPage());
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      errorRef.current?.focus?.();
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      showError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
      if (phoneDigits && !(phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits))) {
        showError("Enter a valid 10-digit mobile number");
        setIsLoading(false);
        return;
      }

      let recaptchaToken = "";
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("register_individual");
      }

      const bodyData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: phoneDigits,
        ...(recaptchaToken && { recaptchaToken }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/signup/individual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const successMessage = data.message || "Registration successful! Please check your email for OTP verification.";
        setSuccess(successMessage);

        // Redirect to OTP verification page
        setTimeout(() => {
          const fromParam = new URLSearchParams(window.location.search).get("from") || "/";
          setLocation(`/verify-otp?email=${encodeURIComponent(data.email || formData.email)}&from=${encodeURIComponent(fromParam)}`);
        }, 1200);
      } else {
        const errorData = await response.json();
        // Handle validation errors from middleware
        if (errorData.error && errorData.error.details) {
          const errorMessages = errorData.error.details.map((err: any) => 
            err.msg || err.message || JSON.stringify(err)
          ).join(", ");
          showError(errorMessages || errorData.error.message || "Registration failed");
        } 
        // Handle validation errors from controller
        else if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err: any) => 
            typeof err === 'string' ? err : err.msg || err.message
          ).join(", ");
          showError(errorMessages || errorData.message || "Registration failed");
        } 
        // Handle simple error message
        else {
          showError(errorData.message || "Registration failed");
        }
      }
    } catch (err) {
      showError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 py-32">
        <div className="w-full max-w-2xl">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-white">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 py-32">
      <div className="w-full max-w-2xl">
        <Card className="bg-[#1a1a1a] border-[#333] relative">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="absolute left-4 top-4 text-gray-400 hover:text-white z-10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold text-white">
              Create Customer Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Shop faster, track orders, and manage your wishlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  aria-live="assertive"
                  role="alert"
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {success && (
                <Alert className="border-green-500 text-green-400">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "phoneNumber",
                          e.target.value.replace(/[^\d]/g, "").slice(0, 10)
                        )
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="10-digit mobile number"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm your password"
                        className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="text-accent hover:text-accent/80 p-0 h-auto"
                  onClick={() =>
                    setLocation(`/login/individual?from=${getPreviousPage()}`)
                  }
                >
                  Sign in here
                </Button>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Are you a business?{" "}
                <Button
                  variant="link"
                  className="text-accent hover:text-accent/80 p-0 h-auto"
                  onClick={() =>
                    setLocation(`/register?from=${getPreviousPage()}`)
                  }
                >
                  Go to business registration
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndividualRegisterPage;

