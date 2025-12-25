import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  name: string;
  userType?: "business" | "individual";
  companyName?: string;
  phoneNumber?: string;
  businessType?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    recaptchaToken?: string,
    userType?: "business" | "individual"
  ) => Promise<{ success: boolean; error?: string }>;
  setUserData: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          // Verify token with backend
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/verify`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            localStorage.removeItem("authToken");
          }
        }
      } catch (error) {
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    recaptchaToken?: string,
    userType: "business" | "individual" = "business"
  ): Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    email?: string;
  }> => {
    try {
      const body: any = { email, password };
      if (recaptchaToken) {
        body.recaptchaToken = recaptchaToken;
      }

      const loginPath =
        userType === "individual"
          ? "/api/auth/signin/individual"
          : "/api/auth/signin";

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}${loginPath}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("authToken", data.token);

        // Trigger cart refresh for multi-device sync
        window.dispatchEvent(
          new CustomEvent("userLogin", {
            detail: { userId: data.user.id, timestamp: Date.now() },
          })
        );

        return { success: true };
      } else {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use status text
          return {
            success: false,
            error: response.statusText || "Login failed",
            requiresVerification: false,
          };
        }

        // Handle different error formats from validation middleware and controllers
        let errorMessage = "Login failed";
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (
          errorData.error?.details &&
          Array.isArray(errorData.error.details)
        ) {
          errorMessage = errorData.error.details
            .map((err: any) => err.msg || err.message || JSON.stringify(err))
            .join(", ");
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors
            .map((err: any) =>
              typeof err === "string" ? err : err.msg || err.message
            )
            .join(", ");
        }

        // Check for requiresVerification flag (for unverified accounts)
        // Only rely on explicit flag from server, not status code
        const requiresVerification =
          errorData.requiresVerification === true ||
          errorData.requiresVerification === "true";

        return {
          success: false,
          error: errorMessage,
          requiresVerification,
          email: errorData.email, // Include email if provided for OTP verification
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const setUserData = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("authToken", token);
  };

  const logout = async () => {
    try {
      // Call server logout endpoint to clear cookies
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
      }
    } catch (error) {
      // Continue with logout even if server call fails
      console.error("Logout server call failed:", error);
    } finally {
      // Clear authentication token
      localStorage.removeItem("authToken");

      // Clear payment transaction data (but keep cart data for potential re-login)
      localStorage.removeItem("phonepe_transaction");

      // Clear user state
      setUser(null);

      // Redirect to home page
      setLocation("/");
    }
  };

  const value: AuthContextType = {
    user,
    login,
    setUserData,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
