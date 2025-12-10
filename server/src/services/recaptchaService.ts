import axios from "axios";
import { config } from "../config/index.js";

export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export const verifyRecaptcha = async (
  token: string,
  expectedAction?: string,
  minimumScore: number = 0.5
): Promise<{ success: boolean; score?: number; message?: string }> => {
  try {
    // Validate token is present and not empty
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      console.error("reCAPTCHA token is missing or empty");
      return {
        success: false,
        message:
          "reCAPTCHA token is missing. Please refresh the page and try again.",
      };
    }

    // Validate secret key is configured
    if (!config.recaptcha.secretKey) {
      console.error("reCAPTCHA secret key is not configured");
      return {
        success: false,
        message: "reCAPTCHA is not properly configured on the server.",
      };
    }

    const response = await axios.post<RecaptchaVerificationResult>(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: config.recaptcha.secretKey,
          response: token,
        },
      }
    );

    const {
      success,
      score,
      action,
      "error-codes": errorCodes,
      hostname,
    } = response.data;

    if (!success) {
      console.error("reCAPTCHA verification failed:", {
        errorCodes,
        hostname,
        tokenLength: token?.length || 0,
        secretKeySet: !!config.recaptcha.secretKey,
      });

      // Provide more specific error messages
      let errorMessage = "reCAPTCHA verification failed";
      if (errorCodes?.includes("invalid-input-response")) {
        errorMessage =
          "Invalid reCAPTCHA token. Please refresh the page and try again.";
      } else if (errorCodes?.includes("invalid-input-secret")) {
        errorMessage = "reCAPTCHA configuration error. Please contact support.";
      } else if (errorCodes?.includes("timeout-or-duplicate")) {
        errorMessage = "reCAPTCHA token expired. Please try again.";
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    // Check if the action matches (for v3)
    if (expectedAction && action !== expectedAction) {
      console.error(
        `reCAPTCHA action mismatch. Expected: ${expectedAction}, Got: ${action}`
      );
      return {
        success: false,
        message: "Invalid reCAPTCHA action",
      };
    }

    // Check the score (for v3)
    if (score !== undefined && score < minimumScore) {
      console.error(
        `reCAPTCHA score too low. Score: ${score}, Minimum: ${minimumScore}`
      );
      return {
        success: false,
        score,
        message: "reCAPTCHA score too low",
      };
    }

    return {
      success: true,
      score,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      message: "reCAPTCHA verification service error",
    };
  }
};
