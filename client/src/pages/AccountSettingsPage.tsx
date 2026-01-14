import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext.tsx";
import { buildApiUrl } from "@/lib/api.ts";
import axios from "axios";
import { useToast } from "@/hooks/use-toast.ts";

const AccountSettingsPage = () => {
  const [, setLocation] = useLocation();
  const { user, setUserData } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State to track if user is individual (will be updated from fetched profile)
  const [isIndividual, setIsIndividual] = useState(() => {
    const userType = (user?.userType || "").toLowerCase();
    return (
      userType === "individual" ||
      (!userType && user && !user.companyName && !user.businessType)
    );
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    // Business fields
    companyName: "",
    businessType: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLocation("/login");
        return;
      }

      setIsLoading(true);
      setError(""); // Clear any previous errors
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          buildApiUrl("/api/auth/user/profile"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const userData = response.data;

        // Determine user type from fetched data
        const fetchedUserType = (userData.userType || "").toLowerCase();

        // Check if user has business fields (non-empty strings)
        const hasCompanyName =
          userData.companyName && String(userData.companyName).trim() !== "";
        const hasBusinessType =
          userData.businessType && String(userData.businessType).trim() !== "";
        const hasIndustry =
          userData.industry && String(userData.industry).trim() !== "";
        const hasAddress =
          userData.address && String(userData.address).trim() !== "";

        // User is individual if:
        // 1. userType is explicitly "individual", OR
        // 2. userType is NOT "business" AND they don't have any business fields
        let fetchedIsIndividual = false;
        if (fetchedUserType === "individual") {
          fetchedIsIndividual = true;
        } else if (fetchedUserType !== "business") {
          // If userType is not set or is something else, check if they have business fields
          fetchedIsIndividual =
            !hasCompanyName && !hasBusinessType && !hasIndustry && !hasAddress;
        } else {
          // If userType is "business", they're business (even if fields are empty)
          fetchedIsIndividual = false;
        }

        setIsIndividual(fetchedIsIndividual);

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phoneNumber: userData.phone || userData.phoneNumber || "",
          companyName: userData.companyName || "",
          businessType: userData.businessType || "",
          industry: userData.industry || "",
          companySize: userData.companySize || "",
          website: userData.website || "",
          description: userData.description || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          pincode: userData.pincode || "",
        });
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        // Use user context as fallback if API fails
        if (user) {
          // Determine user type from context
          const contextUserType = (user.userType || "").toLowerCase();
          const hasCompanyName =
            user.companyName && String(user.companyName).trim() !== "";
          const hasBusinessType =
            user.businessType && String(user.businessType).trim() !== "";
          const hasIndustry =
            user.industry && String(user.industry).trim() !== "";
          const contextIsIndividual =
            contextUserType === "individual" ||
            (contextUserType !== "business" &&
              !hasCompanyName &&
              !hasBusinessType &&
              !hasIndustry);
          setIsIndividual(contextIsIndividual);

          setFormData({
            name: user.name || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            companyName: user.companyName || "",
            businessType: user.businessType || "",
            industry: user.industry || "",
            companySize: user.companySize || "",
            website: user.website || "",
            description: user.description || "",
            address: user.address || "",
            city: user.city || "",
            state: user.state || "",
            pincode: user.pincode || "",
          });
          // Don't show error if we can populate from context
          // setError("Failed to load profile data. Please try again.");
        } else {
          setError("Failed to load profile data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, setLocation]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      const updateData: any = {
        name: formData.name.trim(),
      };

      // Only include phoneNumber if it has a value
      if (formData.phoneNumber && formData.phoneNumber.trim() !== "") {
        updateData.phoneNumber = formData.phoneNumber.trim();
      }

      // Include shipping details for individual users
      // Always send these fields (even if empty) so backend can unset them if needed
      if (isIndividual) {
        updateData.address = formData.address ? formData.address.trim() : "";
        updateData.city = formData.city ? formData.city.trim() : "";
        updateData.state = formData.state ? formData.state.trim() : "";
        updateData.pincode = formData.pincode ? formData.pincode.trim() : "";
      }

      // Only include business fields if user is a business user
      // Always send address fields (even if empty) so backend can unset them if needed
      if (!isIndividual) {
        if (formData.companyName && formData.companyName.trim() !== "") {
          updateData.companyName = formData.companyName.trim();
        }
        if (formData.businessType && formData.businessType.trim() !== "") {
          updateData.businessType = formData.businessType.trim();
        }
        if (formData.industry && formData.industry.trim() !== "") {
          updateData.industry = formData.industry.trim();
        }
        if (formData.companySize && formData.companySize.trim() !== "") {
          updateData.companySize = formData.companySize.trim();
        }
        if (formData.website && formData.website.trim() !== "") {
          updateData.website = formData.website.trim();
        }
        if (formData.description && formData.description.trim() !== "") {
          updateData.description = formData.description.trim();
        }
        // Always send address fields (even if empty) so backend can unset them
        updateData.address = formData.address ? formData.address.trim() : "";
        updateData.city = formData.city ? formData.city.trim() : "";
        updateData.state = formData.state ? formData.state.trim() : "";
        updateData.pincode = formData.pincode ? formData.pincode.trim() : "";
      }

      const response = await axios.put(
        buildApiUrl("/api/auth/user/profile"),
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Update user context with new data
      if (response.data.user && token) {
        setUserData(response.data.user, token);
      }

      // Clear any previous errors
      setError("");
      setSuccess("Profile updated successfully!");
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center pt-28">
        <div className="text-white text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            {isIndividual ? (
              <User className="w-8 h-8 text-accent" />
            ) : (
              <Building2 className="w-8 h-8 text-accent" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-accent">
                Account Settings
              </h1>
              <p className="text-gray-400">
                {isIndividual
                  ? "Update your personal information"
                  : "Update your business information"}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/30 text-red-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/30 text-green-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader>
            <CardTitle className="text-accent">
              {isIndividual ? "Personal Information" : "Business Information"}
            </CardTitle>
            <CardDescription>
              {isIndividual
                ? "Update your account details"
                : "Update your company details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-accent" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-[#2a2a2a] border-[#444] text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-300">
                      Phone Number {isIndividual ? "" : "*"}
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      required={!isIndividual}
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Details - Only for individual users */}
              {isIndividual && (
                <div className="border-t border-[#333] pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-accent" />
                    Shipping Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">
                      Address
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Enter your shipping address"
                      className="bg-[#2a2a2a] border-[#444] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-300">
                        City
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="Enter city"
                        className="bg-[#2a2a2a] border-[#444] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-300">
                        State
                      </Label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        placeholder="Enter state"
                        className="bg-[#2a2a2a] border-[#444] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-gray-300">
                        Pincode
                      </Label>
                      <Input
                        id="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={(e) =>
                          handleInputChange("pincode", e.target.value)
                        }
                        placeholder="Enter pincode"
                        maxLength={6}
                        className="bg-[#2a2a2a] border-[#444] text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business Information - Only for business users */}
              {!isIndividual && (
                <>
                  <div className="border-t border-[#333] pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-accent" />
                      Business Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-gray-300">
                          Company Name *
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleInputChange("companyName", e.target.value)
                          }
                          required
                          className="bg-[#2a2a2a] border-[#444] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-gray-300">
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
                            <SelectItem
                              value="Retail Store"
                              className="text-white"
                            >
                              Retail Store
                            </SelectItem>
                            <SelectItem
                              value="E-commerce"
                              className="text-white"
                            >
                              E-commerce
                            </SelectItem>
                            <SelectItem
                              value="Event Management"
                              className="text-white"
                            >
                              Event Management
                            </SelectItem>
                            <SelectItem
                              value="Corporate"
                              className="text-white"
                            >
                              Corporate
                            </SelectItem>
                            <SelectItem
                              value="Educational Institution"
                              className="text-white"
                            >
                              Educational Institution
                            </SelectItem>
                            <SelectItem
                              value="Distributor"
                              className="text-white"
                            >
                              Distributor
                            </SelectItem>
                            <SelectItem
                              value="Wholesaler"
                              className="text-white"
                            >
                              Wholesaler
                            </SelectItem>
                            <SelectItem value="Other" className="text-white">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-gray-300">
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
                            <SelectItem
                              value="Fashion & Apparel"
                              className="text-white"
                            >
                              Fashion & Apparel
                            </SelectItem>
                            <SelectItem
                              value="Entertainment"
                              className="text-white"
                            >
                              Entertainment
                            </SelectItem>
                            <SelectItem
                              value="Education"
                              className="text-white"
                            >
                              Education
                            </SelectItem>
                            <SelectItem
                              value="Technology"
                              className="text-white"
                            >
                              Technology
                            </SelectItem>
                            <SelectItem
                              value="Healthcare"
                              className="text-white"
                            >
                              Healthcare
                            </SelectItem>
                            <SelectItem value="Finance" className="text-white">
                              Finance
                            </SelectItem>
                            <SelectItem
                              value="Manufacturing"
                              className="text-white"
                            >
                              Manufacturing
                            </SelectItem>
                            <SelectItem value="Services" className="text-white">
                              Services
                            </SelectItem>
                            <SelectItem value="Other" className="text-white">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companySize" className="text-gray-300">
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
                            <SelectItem
                              value="1-10 employees"
                              className="text-white"
                            >
                              1-10 employees
                            </SelectItem>
                            <SelectItem
                              value="11-50 employees"
                              className="text-white"
                            >
                              11-50 employees
                            </SelectItem>
                            <SelectItem
                              value="51-200 employees"
                              className="text-white"
                            >
                              51-200 employees
                            </SelectItem>
                            <SelectItem
                              value="201-500 employees"
                              className="text-white"
                            >
                              201-500 employees
                            </SelectItem>
                            <SelectItem
                              value="500+ employees"
                              className="text-white"
                            >
                              500+ employees
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-gray-300">
                          Website
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            handleInputChange("website", e.target.value)
                          }
                          placeholder="https://example.com"
                          className="bg-[#2a2a2a] border-[#444] text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-300">
                        Company Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        className="bg-[#2a2a2a] border-[#444] text-white"
                        placeholder="Tell us about your company..."
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="border-t border-[#333] pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-accent" />
                      Address Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-300">
                        Address *
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        required
                        className="bg-[#2a2a2a] border-[#444] text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-300">
                          City *
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          required
                          className="bg-[#2a2a2a] border-[#444] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-gray-300">
                          State *
                        </Label>
                        <Input
                          id="state"
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          required
                          className="bg-[#2a2a2a] border-[#444] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-gray-300">
                          Pincode *
                        </Label>
                        <Input
                          id="pincode"
                          type="text"
                          value={formData.pincode}
                          onChange={(e) =>
                            handleInputChange("pincode", e.target.value)
                          }
                          required
                          maxLength={6}
                          className="bg-[#2a2a2a] border-[#444] text-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-[#333]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  className="border-[#444] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent/80 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
