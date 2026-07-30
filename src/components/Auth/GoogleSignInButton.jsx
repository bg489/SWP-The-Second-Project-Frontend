import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

const loadGoogleIdentityScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

const GoogleSignInButton = ({ disabled = false, isDarkMode, onCredential }) => {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [scriptError, setScriptError] = useState("");
  const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const configurationError = clientId
    ? ""
    : "Đăng nhập Google chưa được cấu hình.";

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    if (!clientId) {
      return undefined;
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        setScriptError("");
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              callbackRef.current?.(response.credential);
            }
          },
          cancel_on_tap_outside: true,
        });

        containerRef.current.replaceChildren();
        window.google.accounts.id.renderButton(containerRef.current, {
          locale: "vi",
          logo_alignment: "left",
          shape: "rectangular",
          size: "large",
          text: "continue_with",
          theme: isDarkMode ? "filled_black" : "outline",
          type: "standard",
          width: Math.min(containerRef.current.clientWidth || 360, 400),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setScriptError(
            "Không tải được nút đăng nhập Google. Vui lòng thử lại."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, isDarkMode]);

  return (
    <div className={`google-auth-control ${disabled ? "is-disabled" : ""}`}>
      <div ref={containerRef} className="google-auth-button" />
      {disabled && <span className="google-auth-blocker" aria-hidden="true" />}
      {(configurationError || scriptError) && (
        <p className="google-auth-error">
          {configurationError || scriptError}
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
