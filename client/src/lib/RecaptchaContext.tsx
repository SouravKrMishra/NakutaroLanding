import React, { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface RecaptchaContextProps {
  children: ReactNode;
}

// Get the site key from environment variable
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const RecaptchaProvider: React.FC<RecaptchaContextProps> = ({
  children,
}) => {
  if (!RECAPTCHA_SITE_KEY) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};
