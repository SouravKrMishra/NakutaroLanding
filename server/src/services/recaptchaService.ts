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

    const { success, score, action, "error-codes": errorCodes } = response.data;

    if (!success) {
      console.error("reCAPTCHA verification failed:", errorCodes);
      return {
        success: false,
        message: "reCAPTCHA verification failed",
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
