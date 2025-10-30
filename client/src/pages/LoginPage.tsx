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
import { useAuth } from "@/lib/AuthContext.tsx";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Redirect to dashboard if user is already authenticated
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Get the previous page from URL params or default to business page
  const getPreviousPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get("from");
    return from || "/business";
  };

  const handleBackClick = () => {
    setLocation(getPreviousPage());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let recaptchaToken = "";

      // Execute reCAPTCHA if available
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("login");
      }

      const result = await login(email, password, recaptchaToken);
      if (result.success) {
        setLocation("/dashboard");
      } else {
        setError(
          result.error || "Invalid email or password. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-white">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Don't render the form if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
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
              Business Login
            </CardTitle>
            <CardDescription className="text-gray-400">
              Access your business dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="text-accent hover:text-accent/80 p-0 h-auto"
                  onClick={() =>
                    setLocation(`/register?from=${getPreviousPage()}`)
                  }
                >
                  Register for business access
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
