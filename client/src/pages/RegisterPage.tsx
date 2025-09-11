import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useAuth } from "@/lib/AuthContext.tsx";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    businessType: "",
    industry: "",
    companySize: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    website: "",
    description: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { isAuthenticated, isLoading: authLoading, setUserData } = useAuth();

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      let recaptchaToken = "";

      // Execute reCAPTCHA if available
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("register");
      }

      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registrationData } = formData;

      const bodyData = {
        ...registrationData,
        ...(recaptchaToken && { recaptchaToken }),
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Registration successful! Logging you in...");

        // Set user data in AuthContext to automatically log in
        setUserData(data.user, data.token);

        // Redirect to dashboard after successful registration
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const businessTypes = [
    "Retail Store",
    "E-commerce",
    "Event Management",
    "Corporate",
    "Educational Institution",
    "Distributor",
    "Wholesaler",
    "Other",
  ];

  const industries = [
    "Fashion & Apparel",
    "Entertainment",
    "Education",
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Services",
    "Other",
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees",
  ];

  // Show loading state while checking authentication
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

  // Don't render the form if user is authenticated (will redirect)
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
              Business Registration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create your business account to access exclusive features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 text-green-400">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter your phone number"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">
                      Website (Optional)
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://yourwebsite.com"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-white">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      placeholder="Enter company name"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-white">
                      Business Type *
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) =>
                        handleInputChange("businessType", value)
                      }
                      required
                    >
                      <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white focus:border-accent">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-[#444]">
                        {businessTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-white"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-white">
                      Industry *
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        handleInputChange("industry", value)
                      }
                      required
                    >
                      <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white focus:border-accent">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-[#444]">
                        {industries.map((industry) => (
                          <SelectItem
                            key={industry}
                            value={industry}
                            className="text-white"
                          >
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-white">
                      Company Size *
                    </Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) =>
                        handleInputChange("companySize", value)
                      }
                      required
                    >
                      <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white focus:border-accent">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-[#444]">
                        {companySizes.map((size) => (
                          <SelectItem
                            key={size}
                            value={size}
                            className="text-white"
                          >
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">
                    Street Address *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter your street address"
                    className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="Enter city"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      placeholder="Enter state"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-white">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        handleInputChange("pincode", e.target.value)
                      }
                      placeholder="Enter pincode"
                      className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Business Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Tell us about your business and how you plan to use our services..."
                  className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:border-accent"
                  rows={4}
                />
              </div>

              {/* Password */}
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
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
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
                {isLoading ? "Creating Account..." : "Create Business Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="text-accent hover:text-accent/80 p-0 h-auto"
                  onClick={() =>
                    setLocation(`/login?from=${getPreviousPage()}`)
                  }
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
