/**
 * @fileoverview Cung cấp component giao diện tái sử dụng GoogleSignInButton và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useRef, useState } from "react";

/**
 * Khai báo `GOOGLE_SCRIPT_ID` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/components/Auth/GoogleSignInButton.jsx.
 */
const GOOGLE_SCRIPT_ID = "google-identity-services";
/**
 * Khai báo `GOOGLE_SCRIPT_URL` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/components/Auth/GoogleSignInButton.jsx.
 */
const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

const loadGoogleIdentityScript = () =>
  /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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

/**
 * Thực hiện nghiệp vụ `GoogleSignInButton` (google sign in button). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function GoogleSignInButton
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const GoogleSignInButton = ({ disabled = false, isDarkMode, onCredential }) => {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [scriptError, setScriptError] = useState("");
  const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const configurationError = clientId
    ? ""
    : "Đăng nhập Google chưa được cấu hình.";

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    let cancelled = false;

    if (!clientId) {
      return undefined;
    }

    loadGoogleIdentityScript()
      /* Callback nội bộ của lời gọi `then`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      .then(() => {
        if (cancelled || !containerRef.current) return;

        setScriptError("");
        window.google.accounts.id.initialize({
          client_id: clientId,
          /**
           * Thực hiện nghiệp vụ `callback` (callback). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
           *
           * @function callback
           * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
           * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
           */
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
      /* Callback nội bộ của lời gọi `catch`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      .catch(() => {
        if (!cancelled) {
          setScriptError(
            "Không tải được nút đăng nhập Google. Vui lòng thử lại."
          );
        }
      });

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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
