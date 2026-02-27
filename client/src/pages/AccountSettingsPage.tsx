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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
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
  MapPin,
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext.tsx";
import { buildApiUrl } from "@/lib/api.ts";
import axios from "axios";
import { useToast } from "@/hooks/use-toast.ts";

// Address interface
interface Address {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

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
  });

  // Multiple addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressName, setEditingAddressName] = useState<string | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [editAddress, setEditAddress] = useState<Address>({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; index: number } | null>(null);

  // Max addresses based on user type
  const maxAddresses = isIndividual ? 5 : 2;

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

        // User is individual if:
        // 1. userType is explicitly "individual", OR
        // 2. userType is NOT "business" AND they don't have any business fields
        let fetchedIsIndividual = false;
        if (fetchedUserType === "individual") {
          fetchedIsIndividual = true;
        } else if (fetchedUserType !== "business") {
          // If userType is not set or is something else, check if they have business fields
          fetchedIsIndividual =
            !hasCompanyName && !hasBusinessType && !hasIndustry;
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
        });

        // Set addresses from fetched data
        if (userData.addresses && Array.isArray(userData.addresses)) {
          setAddresses(userData.addresses);
        }
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

  // Address management functions
  const handleNewAddressChange = (field: keyof Address, value: string) => {
    // Enforce numeric 6-digit pincode
    if (field === "pincode") {
      const numeric = value.replace(/\D/g, "").slice(0, 6);
      setNewAddress((prev) => ({ ...prev, pincode: numeric }));
      return;
    }
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditAddressChange = (field: keyof Address, value: string) => {
    if (field === "pincode") {
      const numeric = value.replace(/\D/g, "").slice(0, 6);
      setEditAddress((prev) => ({ ...prev, pincode: numeric }));
      return;
    }
    setEditAddress((prev) => ({ ...prev, [field]: value }));
  };

  const startAddingAddress = () => {
    setNewAddress({
      name: `Address ${addresses.length + 1}`,
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    setIsAddingAddress(true);
  };

  const cancelAddingAddress = () => {
    setIsAddingAddress(false);
    setNewAddress({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const saveNewAddress = async () => {
    // Validate all fields
    if (
      !newAddress.address.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "All address fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{6}$/.test(newAddress.pincode.trim())) {
      toast({
        title: "Validation Error",
        description: "Pincode must be a 6-digit number.",
        variant: "destructive",
      });
      return;
    }

    setAddressSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        buildApiUrl("/api/auth/user/addresses"),
        {
          name: newAddress.name.trim() || `Address ${addresses.length + 1}`,
          address: newAddress.address.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          pincode: newAddress.pincode.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.user && token) {
        setUserData(response.data.user, token);
        setAddresses(response.data.user.addresses || []);
      }

      toast({
        title: "Success",
        description: "Address added successfully.",
      });

      setIsAddingAddress(false);
      setNewAddress({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (error: any) {
      console.error("Error adding address:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddressSaving(false);
    }
  };

  const startEditingAddress = (addr: Address) => {
    setEditingAddressId(addr._id || null);
    setEditAddress({
      name: addr.name,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const cancelEditingAddress = () => {
    setEditingAddressId(null);
    setEditAddress({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const saveEditedAddress = async () => {
    if (!editingAddressId) return;

    // Validate all fields
    if (
      !editAddress.address.trim() ||
      !editAddress.city.trim() ||
      !editAddress.state.trim() ||
      !editAddress.pincode.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "All address fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{6}$/.test(editAddress.pincode.trim())) {
      toast({
        title: "Validation Error",
        description: "Pincode must be a 6-digit number.",
        variant: "destructive",
      });
      return;
    }

    setAddressSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        buildApiUrl(`/api/auth/user/addresses/${editingAddressId}`),
        {
          name: editAddress.name.trim(),
          address: editAddress.address.trim(),
          city: editAddress.city.trim(),
          state: editAddress.state.trim(),
          pincode: editAddress.pincode.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.user && token) {
        setUserData(response.data.user, token);
        setAddresses(response.data.user.addresses || []);
      }

      toast({
        title: "Success",
        description: "Address updated successfully.",
      });

      setEditingAddressId(null);
      setEditAddress({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (error: any) {
      console.error("Error updating address:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = (addressId: string, index: number) => {
    // Business users cannot delete Address 1
    if (!isIndividual && index === 0) {
      toast({
        title: "Cannot Delete",
        description: "Business users cannot delete their primary address.",
        variant: "destructive",
      });
      return;
    }
    setDeleteConfirm({ id: addressId, index });
  };

  const confirmDeleteAddress = async () => {
    if (!deleteConfirm) return;
    const { id: addressId } = deleteConfirm;
    setDeleteConfirm(null);
    setAddressSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        buildApiUrl(`/api/auth/user/addresses/${addressId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.user && token) {
        setUserData(response.data.user, token);
        setAddresses(response.data.user.addresses || []);
      }

      toast({
        title: "Success",
        description: "Address deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddressSaving(false);
    }
  };

  const startRenamingAddress = (addr: Address) => {
    setEditingAddressName(addr._id || null);
    setEditAddress((prev) => ({ ...prev, name: addr.name }));
  };

  const saveAddressName = async (addressId: string, addr: Address) => {
    if (!editAddress.name.trim()) {
      toast({
        title: "Error",
        description: "Address name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setAddressSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        buildApiUrl(`/api/auth/user/addresses/${addressId}`),
        {
          name: editAddress.name.trim(),
          address: addr.address,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.user && token) {
        setUserData(response.data.user, token);
        setAddresses(response.data.user.addresses || []);
      }

      toast({
        title: "Success",
        description: "Address name updated.",
      });

      setEditingAddressName(null);
    } catch (error: any) {
      console.error("Error renaming address:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to rename address.",
        variant: "destructive",
      });
    } finally {
      setAddressSaving(false);
    }
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

      // Only include business fields if user is a business user
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

              {/* Multiple Shipping Addresses - For individual users */}
              {isIndividual && (
                <div className="border-t border-[#333] pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-accent" />
                      Shipping Addresses
                    </h3>
                    {addresses.length < maxAddresses && !isAddingAddress && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startAddingAddress}
                        className="border-accent text-accent hover:bg-accent/20 hover:text-accent"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Address
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    You can save up to {maxAddresses} addresses. ({addresses.length}/{maxAddresses} used)
                  </p>

                  {/* Add New Address Form */}
                  {isAddingAddress && (
                    <div
                      id="new-address-form"
                      className="bg-[#2a2a2a] border border-accent/50 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-accent">New Address</h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={cancelAddingAddress}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Address Name</Label>
                        <Input
                          value={newAddress.name}
                          onChange={(e) =>
                            handleNewAddressChange("name", e.target.value)
                          }
                          className="bg-[#1a1a1a] border-[#555] text-white"
                          placeholder={`Address ${addresses.length + 1}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Address *</Label>
                        <Input
                          value={newAddress.address}
                          onChange={(e) =>
                            handleNewAddressChange("address", e.target.value)
                          }
                          className="bg-[#1a1a1a] border-[#555] text-white"
                          placeholder="Enter your shipping address"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">City *</Label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) =>
                              handleNewAddressChange("city", e.target.value)
                            }
                            className="bg-[#1a1a1a] border-[#555] text-white"
                            placeholder="Enter city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">State *</Label>
                          <Input
                            value={newAddress.state}
                            onChange={(e) =>
                              handleNewAddressChange("state", e.target.value)
                            }
                            className="bg-[#1a1a1a] border-[#555] text-white"
                            placeholder="Enter state"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Pincode *</Label>
                          <Input
                            value={newAddress.pincode}
                            onChange={(e) =>
                              handleNewAddressChange("pincode", e.target.value)
                            }
                            className="bg-[#1a1a1a] border-[#555] text-white"
                            placeholder="Enter pincode"
                            maxLength={6}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelAddingAddress}
                          className="border-gray-500/50 text-gray-400 hover:border-gray-400 hover:text-gray-300 hover:bg-gray-500/10 text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={saveNewAddress}
                          disabled={addressSaving}
                          className="bg-accent hover:bg-accent/90 text-white text-sm"
                        >
                          {addressSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Address
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing Addresses */}
                  <div className="space-y-4">
                    {addresses.map((addr, index) => (
                      <div
                        key={addr._id || index}
                        className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4"
                      >
                        {editingAddressId === addr._id ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Input
                                value={editAddress.name}
                                onChange={(e) =>
                                  handleEditAddressChange("name", e.target.value)
                                }
                                className="bg-[#1a1a1a] border-[#555] text-white w-48"
                                placeholder="Address name"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={saveEditedAddress}
                                  disabled={addressSaving}
                                  className="bg-green-600 hover:bg-green-500 text-white"
                                >
                                  {addressSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                variant="outline"
                                onClick={cancelEditingAddress}
                                className="border-gray-500/50 text-gray-400 hover:border-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-300">Address *</Label>
                              <Input
                                value={editAddress.address}
                                onChange={(e) =>
                                  handleEditAddressChange("address", e.target.value)
                                }
                                className="bg-[#1a1a1a] border-[#555] text-white"
                                placeholder="Enter address"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-gray-300">City *</Label>
                                <Input
                                  value={editAddress.city}
                                  onChange={(e) =>
                                    handleEditAddressChange("city", e.target.value)
                                  }
                                  className="bg-[#1a1a1a] border-[#555] text-white"
                                  placeholder="Enter city"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-300">State *</Label>
                                <Input
                                  value={editAddress.state}
                                  onChange={(e) =>
                                    handleEditAddressChange("state", e.target.value)
                                  }
                                  className="bg-[#1a1a1a] border-[#555] text-white"
                                  placeholder="Enter state"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-300">Pincode *</Label>
                                <Input
                                  value={editAddress.pincode}
                                  onChange={(e) =>
                                    handleEditAddressChange("pincode", e.target.value)
                                  }
                                  className="bg-[#1a1a1a] border-[#555] text-white"
                                  placeholder="Enter pincode"
                                  maxLength={6}
                                />
                              </div>
                            </div>
                          </div>
                        ) : editingAddressName === addr._id ? (
                          // Rename mode
                          <div className="flex items-center justify-between mb-3">
                            <Input
                              value={editAddress.name}
                              onChange={(e) =>
                                setEditAddress((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="bg-[#1a1a1a] border-[#555] text-white w-48"
                              placeholder="Address name"
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => saveAddressName(addr._id!, addr)}
                                disabled={addressSaving}
                                className="bg-green-600 hover:bg-green-500 text-white"
                              >
                                {addressSaving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingAddressName(null)}
                                className="border-gray-500/50 text-gray-400 hover:border-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-accent">
                                  {addr.name}
                                </h4>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startRenamingAddress(addr)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingAddress(addr)}
                                  className="border-[#555] text-gray-300 hover:text-white hover:bg-[#333] text-sm"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteAddress(addr._id!, index)}
                                  disabled={addressSaving}
                                  className="border-red-500/60 text-red-400 hover:border-red-400 hover:bg-transparent hover:text-red-300 text-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-gray-300 text-sm">
                              <p>{addr.address}</p>
                              <p>
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Empty state */}
                  {addresses.length === 0 && !isAddingAddress && (
                    <div className="text-center py-8 text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No addresses saved yet.</p>
                      <p className="text-sm mt-1">
                        Add an address to use during checkout.
                      </p>
                    </div>
                  )}
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

                  {/* Multiple Addresses for Business Users */}
                  <div className="border-t border-[#333] pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-accent" />
                        Business Addresses
                      </h3>
                      {addresses.length < maxAddresses && !isAddingAddress && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startAddingAddress}
                           className="border-accent text-accent hover:bg-accent/20 hover:text-accent"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Address
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      You can save up to {maxAddresses} addresses. ({addresses.length}/{maxAddresses} used)
                      {addresses.length > 0 && (
                        <span className="text-yellow-500 ml-2">
                          Note: Address 1 cannot be deleted.
                        </span>
                      )}
                    </p>

                    {/* Existing Addresses */}
                    <div className="space-y-4">
                      {addresses.map((addr, index) => (
                        <div
                          key={addr._id || index}
                          className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4"
                        >
                          {editingAddressId === addr._id ? (
                            // Edit mode
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Input
                                  value={editAddress.name}
                                  onChange={(e) =>
                                    handleEditAddressChange("name", e.target.value)
                                  }
                                  className="bg-[#1a1a1a] border-[#555] text-white w-48"
                                  placeholder="Address name"
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={saveEditedAddress}
                                    disabled={addressSaving}
                                    className="bg-green-600 hover:bg-green-500 text-white"
                                  >
                                    {addressSaving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                variant="outline"
                                onClick={cancelEditingAddress}
                                className="border-gray-500/50 text-gray-400 hover:border-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-300">Address *</Label>
                                <Input
                                  value={editAddress.address}
                                  onChange={(e) =>
                                    handleEditAddressChange("address", e.target.value)
                                  }
                                  className="bg-[#1a1a1a] border-[#555] text-white"
                                  placeholder="Enter address"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-gray-300">City *</Label>
                                  <Input
                                    value={editAddress.city}
                                    onChange={(e) =>
                                      handleEditAddressChange("city", e.target.value)
                                    }
                                    className="bg-[#1a1a1a] border-[#555] text-white"
                                    placeholder="Enter city"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-gray-300">State *</Label>
                                  <Input
                                    value={editAddress.state}
                                    onChange={(e) =>
                                      handleEditAddressChange("state", e.target.value)
                                    }
                                    className="bg-[#1a1a1a] border-[#555] text-white"
                                    placeholder="Enter state"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-gray-300">Pincode *</Label>
                                  <Input
                                    value={editAddress.pincode}
                                    onChange={(e) =>
                                      handleEditAddressChange("pincode", e.target.value)
                                    }
                                    className="bg-[#1a1a1a] border-[#555] text-white"
                                    placeholder="Enter pincode"
                                    maxLength={6}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : editingAddressName === addr._id ? (
                            // Rename mode
                            <div className="flex items-center justify-between mb-3">
                              <Input
                                value={editAddress.name}
                                onChange={(e) =>
                                  setEditAddress((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                className="bg-[#1a1a1a] border-[#555] text-white w-48"
                                placeholder="Address name"
                                autoFocus
                              />
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => saveAddressName(addr._id!, addr)}
                                  disabled={addressSaving}
                                  className="bg-green-600 hover:bg-green-500 text-white"
                                >
                                  {addressSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingAddressName(null)}
                                  className="border-gray-500 text-gray-400"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-accent">
                                    {addr.name}
                                  </h4>
                                  {index === 0 && (
                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                      Primary
                                    </span>
                                  )}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startRenamingAddress(addr)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditingAddress(addr)}
                                    className="border-[#555] text-gray-300 hover:text-white hover:bg-[#333]"
                                  >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  {index !== 0 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteAddress(addr._id!, index)}
                                      disabled={addressSaving}
                                     className="border-red-500/60 text-red-400 hover:border-red-400 hover:bg-transparent hover:text-red-300 text-sm"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="text-gray-300 text-sm">
                                <p>{addr.address}</p>
                                <p>
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add New Address Form */}
                    {isAddingAddress && (
                      <div
                        id="new-address-form"
                        className="bg-[#2a2a2a] border border-accent/50 rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-accent">New Address</h4>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={cancelAddingAddress}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Address Name</Label>
                          <Input
                            value={newAddress.name}
                            onChange={(e) =>
                              handleNewAddressChange("name", e.target.value)
                            }
                            className="bg-[#1a1a1a] border-[#555] text-white"
                            placeholder={`Address ${addresses.length + 1}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Address *</Label>
                          <Input
                            value={newAddress.address}
                            onChange={(e) =>
                              handleNewAddressChange("address", e.target.value)
                            }
                            className="bg-[#1a1a1a] border-[#555] text-white"
                            placeholder="Enter your business address"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-300">City *</Label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) =>
                                handleNewAddressChange("city", e.target.value)
                              }
                              className="bg-[#1a1a1a] border-[#555] text-white"
                              placeholder="Enter city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">State *</Label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) =>
                                handleNewAddressChange("state", e.target.value)
                              }
                              className="bg-[#1a1a1a] border-[#555] text-white"
                              placeholder="Enter state"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Pincode *</Label>
                            <Input
                              value={newAddress.pincode}
                              onChange={(e) =>
                                handleNewAddressChange("pincode", e.target.value)
                              }
                              className="bg-[#1a1a1a] border-[#555] text-white"
                              placeholder="Enter pincode"
                              maxLength={6}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelAddingAddress}
                             className="border-gray-500 text-gray-400 text-sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={saveNewAddress}
                            disabled={addressSaving}
                             className="bg-accent hover:bg-accent/90 text-white text-sm"
                          >
                            {addressSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Address
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Empty state - Business users need at least one address */}
                    {addresses.length === 0 && !isAddingAddress && (
                      <div className="text-center py-8 text-gray-400 bg-[#2a2a2a] border border-[#444] rounded-lg">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-yellow-400">No addresses saved yet.</p>
                        <p className="text-sm mt-1">
                          Add your primary business address to continue.
                        </p>
                        <Button
                          type="button"
                          onClick={startAddingAddress}
                          className="mt-4 bg-accent hover:bg-accent/80"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Primary Address
                        </Button>
                      </div>
                    )}
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

      {/* Delete address confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <AlertDialogContent className="bg-[#1f1f1f] border border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Address</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#444] text-gray-300 hover:bg-[#2a2a2a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAddress}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSettingsPage;
