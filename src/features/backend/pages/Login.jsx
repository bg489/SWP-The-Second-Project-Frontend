import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    BadgeCheck,
    Car,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Moon,
    QrCode,
    RefreshCcw,
    Sparkles,
    Sun,
} from "lucide-react";

import Button from "../../../components/Button/Button";
import GoogleSignInButton from "../../../components/Auth/GoogleSignInButton";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import { useMockAuth } from "../../../context/MockAuthContext";
import useResetAfterSuccess from "../../../hooks/useResetAfterSuccess";
import {
    clearRegisterState,
    clearPasswordResetState,
    fetchRegisterBuildingsRequest,
    googleAuthRequest,
    loginRequest,
    registerRequest,
    resendRegistrationOtpRequest,
    requestPasswordResetRequest,
    resetPasswordRequest,
    verifyPasswordResetRequest,
    verifyRegistrationRequest,
} from "../auth/authSlice";
import {
    roleHomePaths,
} from "../../../services/mockParkingData";
import {
    isValidOptionalVietnamPhone,
    sanitizeVietnamPhoneInput,
    VIETNAM_PHONE_ERROR,
} from "../../../utils/phone";

const EMPTY_REGISTER_FORM = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    buildingId: "",
};

const EMPTY_RESET_FORM = {
    email: "",
    otp: "",
    token: "",
    password: "",
    confirmPassword: "",
};

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { login, isDarkMode, toggleDarkMode } = useMockAuth();

    const [mode, setMode] = useState(searchParams.get("mode") === "reset" ? "reset" : "login");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER_FORM);
    const [registrationOtp, setRegistrationOtp] = useState("");
    const [registrationOtpError, setRegistrationOtpError] = useState("");
    const [manualVerificationEmail, setManualVerificationEmail] = useState("");
    const [verificationEmailError, setVerificationEmailError] = useState("");
    const [showManualVerification, setShowManualVerification] = useState(false);

    const [registerErrors, setRegisterErrors] = useState({});
    const [resetForm, setResetForm] = useState({
        email: searchParams.get("email") || "",
        otp: "",
        token: searchParams.get("token") || "",
        password: "",
        confirmPassword: "",
    });
    const [resetErrors, setResetErrors] = useState({});

    const {
        loading,
        googleLoading,
        error,
        loginCompleted,
        frontendRole,
        user,
        token,
        registerLoading,
        registerError,
        registerSuccess,
        registeredUser,
        registrationVerificationLoading,
        registrationVerificationAction,
        registrationVerificationError,
        registrationVerificationNotice,
        registrationVerified,
        requiresBuildingSelection,
        registerBuildings,
        registerBuildingsLoading,
        registerBuildingsError,
        passwordResetLoading,
        passwordResetAction,
        passwordResetError,
        passwordResetNotice,
        passwordResetVerified,
        passwordResetCompleted,
    } = useSelector((state) => state.auth);
    const requestingPasswordReset = passwordResetAction === "request";
    const verifyingPasswordReset = passwordResetAction === "verify";
    const changingPassword = passwordResetAction === "reset";
    const markRegisterSubmitted = useResetAfterSuccess({
        submitting: registerLoading,
        success: registerSuccess,
        error: registerError,
        onSuccess: () => {
            setRegisterForm(EMPTY_REGISTER_FORM);
            setRegisterErrors({});
            setShowRegisterPassword(false);
            setShowConfirmPassword(false);
        },
    });
    const markPasswordChangeSubmitted = useResetAfterSuccess({
        submitting: changingPassword,
        success: passwordResetCompleted,
        error: passwordResetError,
        onSuccess: () => {
            setResetForm(EMPTY_RESET_FORM);
            setResetErrors({});
            setShowResetPassword(false);
        },
    });

    useEffect(() => {
        dispatch(fetchRegisterBuildingsRequest());
    }, [dispatch]);

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setErrors({});
        setRegisterErrors({});
        setResetErrors({});
        setRegistrationOtp("");
        setRegistrationOtpError("");
        setManualVerificationEmail("");
        setVerificationEmailError("");
        setShowManualVerification(false);
        dispatch(clearRegisterState());
        dispatch(clearPasswordResetState());
    };

    const updateRegisterField = (field, value) => {
        const nextValue = field === "phone"
            ? sanitizeVietnamPhoneInput(value)
            : value;

        setRegisterForm((prev) => ({
            ...prev,
            [field]: nextValue,
        }));

        setRegisterErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const validateRegisterForm = () => {
        const nextErrors = {};

        if (!registerForm.name.trim()) {
            nextErrors.name = "Vui lòng nhập họ tên.";
        }

        if (!registerForm.email.trim()) {
            nextErrors.email = "Vui lòng nhập email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim())) {
            nextErrors.email = "Email không hợp lệ.";
        }

        if (!isValidOptionalVietnamPhone(registerForm.phone)) {
            nextErrors.phone = VIETNAM_PHONE_ERROR;
        }

        if (!registerForm.password) {
            nextErrors.password = "Vui lòng nhập mật khẩu.";
        } else if (registerForm.password.length < 6) {
            nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        if (registerForm.confirmPassword !== registerForm.password) {
            nextErrors.confirmPassword = "Mật khẩu nhập lại không khớp.";
        }

        if (!registerForm.buildingId) {
            nextErrors.buildingId = "Vui lòng chọn tòa nhà.";
        }

        setRegisterErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleRegisterSubmit = (event) => {
        event.preventDefault();

        if (!validateRegisterForm()) return;

        const payload = {
            name: registerForm.name.trim(),
            email: registerForm.email.trim(),
            password: registerForm.password,
            buildingId: Number(registerForm.buildingId),
        };

        if (registerForm.phone.trim()) {
            payload.phone = registerForm.phone.trim();
        }

        markRegisterSubmitted();
        dispatch(registerRequest(payload));
    };

    const [form, setForm] = useState({
        emailOrPhone: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const verificationEmail =
        registeredUser?.email || manualVerificationEmail.trim();
    const verifyingRegistration =
        registrationVerificationAction === "verify";
    const resendingRegistrationOtp =
        registrationVerificationAction === "resend";

    const updateResetField = (field, value) => {
        setResetForm((prev) => ({
            ...prev,
            [field]: field === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
        }));
        setResetErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const passwordToggle = (visible, onClick, label) => (
        <button
            aria-label={label}
            className="input-icon-button"
            type="button"
            onClick={onClick}
        >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
    );

    useEffect(() => {
        if (!loginCompleted || !token) return;

        const role = frontendRole || "USER";

        login(role, user, token);

        navigate(
            requiresBuildingSelection
                ? "/choose-building"
                : roleHomePaths[role] || "/user/dashboard",
            {
            replace: true,
            }
        );
    }, [
        frontendRole,
        login,
        loginCompleted,
        navigate,
        requiresBuildingSelection,
        token,
        user,
    ]);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.emailOrPhone.trim()) {
            nextErrors.emailOrPhone = "Vui lòng nhập email hoặc số điện thoại.";
        }

        if (!form.password) {
            nextErrors.password = "Vui lòng nhập mật khẩu.";
        }

        if (form.password && form.password.length < 6) {
            nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        dispatch(
            loginRequest({
                emailOrPhone: form.emailOrPhone.trim(),
                password: form.password,
            })
        );
    };

    const handleGoogleCredential = (credential) => {
        dispatch(googleAuthRequest({ credential }));
    };

    const handleVerifyRegistration = (event) => {
        event.preventDefault();
        const otp = registrationOtp.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationEmail)) {
            setVerificationEmailError("Email không hợp lệ.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setRegistrationOtpError("Mã OTP phải có đúng 6 chữ số.");
            return;
        }

        setRegistrationOtpError("");
        dispatch(
            verifyRegistrationRequest({
                email: verificationEmail,
                otp,
            })
        );
    };

    const handleResendRegistrationOtp = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationEmail)) {
            setVerificationEmailError("Email không hợp lệ.");
            return;
        }

        setVerificationEmailError("");
        setRegistrationOtpError("");
        dispatch(resendRegistrationOtpRequest({ email: verificationEmail }));
    };

    const continueToLogin = () => {
        setForm({
            emailOrPhone: verificationEmail,
            password: "",
        });
        setRegistrationOtp("");
        setMode("login");
    };

    const validateResetEmail = () => {
        const nextErrors = {};

        if (!resetForm.email.trim()) {
            nextErrors.email = "Vui lòng nhập email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetForm.email.trim())) {
            nextErrors.email = "Email không hợp lệ.";
        }

        setResetErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleRequestReset = (event) => {
        event.preventDefault();
        if (!validateResetEmail()) return;
        dispatch(requestPasswordResetRequest({ email: resetForm.email.trim() }));
    };

    const validateResetVerification = () => {
        const nextErrors = {};

        if (!resetForm.email.trim()) {
            nextErrors.email = "Vui lòng nhập email.";
        }

        if (!resetForm.otp.trim() && !resetForm.token.trim()) {
            nextErrors.otp = "Nhập OTP trong email hoặc dùng link xác minh.";
        }

        setResetErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleVerifyReset = (event) => {
        event.preventDefault();
        if (!validateResetVerification()) return;
        dispatch(
            verifyPasswordResetRequest({
                email: resetForm.email.trim(),
                otp: resetForm.otp.trim() || undefined,
                token: resetForm.token.trim() || undefined,
            })
        );
    };

    const handleResetPassword = (event) => {
        event.preventDefault();
        const nextErrors = {};

        if (!validateResetVerification()) return;

        if (!resetForm.password) {
            nextErrors.password = "Vui lòng nhập mật khẩu mới.";
        } else if (resetForm.password.length < 6) {
            nextErrors.password = "Mật khẩu mới phải có ít nhất 6 ký tự.";
        }

        if (resetForm.confirmPassword !== resetForm.password) {
            nextErrors.confirmPassword = "Mật khẩu nhập lại không khớp.";
        }

        setResetErrors((prev) => ({ ...prev, ...nextErrors }));
        if (Object.keys(nextErrors).length > 0) return;

        markPasswordChangeSubmitted();
        dispatch(
            resetPasswordRequest({
                email: resetForm.email.trim(),
                otp: resetForm.otp.trim() || undefined,
                token: resetForm.token.trim() || undefined,
                password: resetForm.password,
            })
        );
    };

    return (
        <div className="login-shell">
            <section className="login-story">
                <div>
                    <div className="page-eyebrow">
                        <Sparkles size={16} /> Sunrise Parking
                    </div>

                    <h1 className="page-title">Hệ thống quản lý tòa giữ xe</h1>

                    <p className="page-subtitle">
                        Một tòa nhà, xe máy theo sức chứa, ô tô theo từng ô đỗ,
                        mã QR tháng và QR tạm cho khách vãng lai.
                    </p>
                </div>

                <div className="dashboard-grid">
                    <div className="soft-panel">
                        <Car size={20} color="var(--primary)" />
                        <div className="metric-value">2 loại xe</div>
                        <div className="metric-note">
                            Xe máy theo số lượng, ô tô theo từng ô đỗ.
                        </div>
                    </div>

                    <div className="soft-panel">
                        <QrCode size={20} color="var(--primary)" />
                        <div className="metric-value">Ra vào bằng QR</div>
                        <div className="metric-note">
                            Gói tháng, xe ra vào và QR tạm.
                        </div>
                    </div>
                </div>
            </section>

            <main className="login-panel-wrap">
                <div
                    className="card section-card"
                    style={{ maxWidth: 520, width: "100%", margin: "0 auto" }}
                >
                    <div className="section-header">
                        <div>

                            {mode === "login" && (
                                <>

                                    <h2 className="section-title">Đăng nhập hệ thống</h2>




                                </>
                            )}

                            {mode === "register" && (
                                <>

                                    <h2 className="section-title">Đăng ký tài khoản</h2>


                                </>
                            )}

                            {mode === "reset" && (
                                <>
                                    <h2 className="section-title">Đổi mật khẩu</h2>
                                </>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleDarkMode}
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </Button>
                    </div>

                    <div className="auth-mode-tabs">
                        <Button
                            type="button"
                            variant={mode === "login" ? "primary" : "outline"}
                            onClick={() => switchMode("login")}
                            disabled={loading || googleLoading || registerLoading}
                        >
                            Đăng nhập
                        </Button>

                        <Button
                            type="button"
                            variant={mode === "register" ? "primary" : "outline"}
                            onClick={() => switchMode("register")}
                            disabled={loading || googleLoading || registerLoading}
                        >
                            Đăng ký
                        </Button>

                        <Button
                            type="button"
                            variant={mode === "reset" ? "primary" : "outline"}
                            onClick={() => switchMode("reset")}
                            disabled={
                                loading ||
                                googleLoading ||
                                registerLoading ||
                                passwordResetLoading
                            }
                        >
                            Quên mật khẩu
                        </Button>
                    </div>

                    <StatusBanner
                        success={
                            mode === "login" && registrationVerified
                                ? registrationVerificationNotice
                                : null
                        }
                        errors={error}
                    />

                    {(mode === "login" ||
                        (mode === "register" &&
                            !registerSuccess &&
                            !showManualVerification)) && (
                        <div className="google-auth-section">
                            <GoogleSignInButton
                                disabled={loading || googleLoading || registerLoading}
                                isDarkMode={isDarkMode}
                                onCredential={handleGoogleCredential}
                            />
                            <div className="auth-divider">
                                <span>hoặc dùng email</span>
                            </div>
                        </div>
                    )}

                    {mode === "login" && (
                        <>
                            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                                <FormField
                                    label="Email hoặc số điện thoại"
                                    required
                                    error={errors.emailOrPhone}
                                >
                                    <Input
                                        icon={Mail}
                                        placeholder="Nhập email hoặc số điện thoại"
                                        value={form.emailOrPhone}
                                        onChange={(event) =>
                                            updateField("emailOrPhone", event.target.value)
                                        }
                                        disabled={loading || googleLoading}
                                        autoComplete="username"
                                    />
                                </FormField>

                                <FormField label="Mật khẩu" required error={errors.password}>
                                    <Input
                                        icon={Lock}
                                        type={showLoginPassword ? "text" : "password"}
                                        placeholder="••••••"
                                        value={form.password}
                                        onChange={(event) =>
                                            updateField("password", event.target.value)
                                        }
                                        disabled={loading || googleLoading}
                                        autoComplete="current-password"
                                        rightElement={passwordToggle(
                                            showLoginPassword,
                                            () => setShowLoginPassword((value) => !value),
                                            showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                                        )}
                                    />
                                </FormField>

                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={loading}
                                    disabled={loading || googleLoading}
                                    icon={KeyRound}
                                >
                                    {loading
                                        ? "Đang đăng nhập..."
                                        : googleLoading
                                          ? "Đang kết nối Google..."
                                          : "Đăng nhập"}
                                </Button>
                            </form>

                        </>
                    )}

                    {mode === "register" && (
                        <>
                            <StatusBanner
                                success={
                                    registrationVerificationNotice ||
                                    (registerSuccess
                                        ? "Tài khoản đã được tạo. Nhập mã OTP trong email để kích hoạt."
                                        : null)
                                }
                                errors={[
                                    registerError,
                                    registrationVerificationError,
                                ]}
                            />

                            {!registerSuccess && !showManualVerification && (
                            <form onSubmit={handleRegisterSubmit} style={{ display: "grid", gap: 16 }}>
                                <FormField label="Họ tên" required error={registerErrors.name}>
                                    <Input
                                        placeholder="Nguyễn Văn A"
                                        value={registerForm.name}
                                        onChange={(event) => updateRegisterField("name", event.target.value)}
                                        disabled={registerLoading}
                                        autoComplete="name"
                                    />
                                </FormField>

                                <FormField label="Email" required error={registerErrors.email}>
                                    <Input
                                        icon={Mail}
                                        type="email"
                                        placeholder="user@example.com"
                                        value={registerForm.email}
                                        onChange={(event) => updateRegisterField("email", event.target.value)}
                                        disabled={registerLoading}
                                        autoComplete="email"
                                    />
                                </FormField>

                                <FormField
                                    label="Số điện thoại (không bắt buộc)"
                                    error={registerErrors.phone}
                                >
                                    <Input
                                        placeholder="0901234567"
                                        value={registerForm.phone}
                                        onChange={(event) => updateRegisterField("phone", event.target.value)}
                                        disabled={registerLoading}
                                        autoComplete="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                    />
                                </FormField>

                                <FormField label="Tòa nhà đăng ký" required error={registerErrors.buildingId}>
                                    <select
                                        className="form-input"
                                        value={registerForm.buildingId}
                                        onChange={(event) =>
                                            updateRegisterField("buildingId", event.target.value)
                                        }
                                        disabled={registerLoading || registerBuildingsLoading}
                                    >
                                        <option value="">
                                            {registerBuildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
                                        </option>

                                        {registerBuildings.map((building) => (
                                            <option key={building.id} value={building.id}>
                                                {building.name}
                                                {building.address ? ` - ${building.address}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                {registerBuildingsError && (
                                    <p style={{ color: "var(--danger)", marginTop: -8 }}>
                                        {registerBuildingsError}
                                    </p>
                                )}

                                <FormField label="Mật khẩu" required error={registerErrors.password}>
                                    <Input
                                        icon={Lock}
                                        type={showRegisterPassword ? "text" : "password"}
                                        placeholder="Ít nhất 6 ký tự"
                                        value={registerForm.password}
                                        onChange={(event) =>
                                            updateRegisterField("password", event.target.value)
                                        }
                                        disabled={registerLoading}
                                        autoComplete="new-password"
                                        rightElement={passwordToggle(
                                            showRegisterPassword,
                                            () => setShowRegisterPassword((value) => !value),
                                            showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                                        )}
                                    />
                                </FormField>

                                <FormField
                                    label="Nhập lại mật khẩu"
                                    required
                                    error={registerErrors.confirmPassword}
                                >
                                    <Input
                                        icon={Lock}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        value={registerForm.confirmPassword}
                                        onChange={(event) =>
                                            updateRegisterField("confirmPassword", event.target.value)
                                        }
                                        disabled={registerLoading}
                                        autoComplete="new-password"
                                        rightElement={passwordToggle(
                                            showConfirmPassword,
                                            () => setShowConfirmPassword((value) => !value),
                                            showConfirmPassword ? "Ẩn mật khẩu nhập lại" : "Hiện mật khẩu nhập lại"
                                        )}
                                    />
                                </FormField>

                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={registerLoading}
                                    disabled={registerLoading}
                                >
                                    {registerLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setManualVerificationEmail(
                                            registerForm.email.trim()
                                        );
                                        setShowManualVerification(true);
                                    }}
                                >
                                    Tôi đã có mã OTP
                                </Button>
                            </form>
                            )}

                            {(registerSuccess || showManualVerification) && (
                                <form
                                    className="registration-verification-card"
                                    onSubmit={handleVerifyRegistration}
                                >
                                    <div className="registration-verification-heading">
                                        <span className="metric-icon">
                                            <BadgeCheck size={20} />
                                        </span>
                                        <div>
                                            <strong>Xác minh email</strong>
                                            <p className="section-copy">
                                                Nhập mã gồm 6 số đã được gửi tới
                                                email đăng ký.
                                            </p>
                                        </div>
                                    </div>

                                    {!registrationVerified ? (
                                        <>
                                            {!registeredUser?.email && (
                                                <FormField
                                                    label="Email đăng ký"
                                                    required
                                                    error={verificationEmailError}
                                                >
                                                    <Input
                                                        icon={Mail}
                                                        type="email"
                                                        value={
                                                            manualVerificationEmail
                                                        }
                                                        onChange={(event) => {
                                                            setManualVerificationEmail(
                                                                event.target.value
                                                            );
                                                            setVerificationEmailError(
                                                                ""
                                                            );
                                                        }}
                                                        placeholder="user@example.com"
                                                        disabled={
                                                            registrationVerificationLoading
                                                        }
                                                    />
                                                </FormField>
                                            )}

                                            {registeredUser?.email && (
                                                <div className="soft-panel">
                                                    <strong>
                                                        {registeredUser.email}
                                                    </strong>
                                                </div>
                                            )}

                                            <FormField
                                                label="Mã OTP"
                                                required
                                                error={registrationOtpError}
                                            >
                                                <Input
                                                    value={registrationOtp}
                                                    onChange={(event) => {
                                                        setRegistrationOtp(
                                                            event.target.value
                                                                .replace(/\D/g, "")
                                                                .slice(0, 6)
                                                        );
                                                        setRegistrationOtpError("");
                                                    }}
                                                    placeholder="Nhập 6 chữ số"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    disabled={
                                                        registrationVerificationLoading
                                                    }
                                                />
                                            </FormField>

                                            <div className="registration-verification-actions">
                                                <Button
                                                    type="submit"
                                                    loading={verifyingRegistration}
                                                    disabled={
                                                        registrationVerificationLoading
                                                    }
                                                    icon={BadgeCheck}
                                                >
                                                    Xác minh tài khoản
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    loading={resendingRegistrationOtp}
                                                    disabled={
                                                        registrationVerificationLoading
                                                    }
                                                    icon={RefreshCcw}
                                                    onClick={
                                                        handleResendRegistrationOtp
                                                    }
                                                >
                                                    Gửi lại mã
                                                </Button>
                                            </div>

                                            {showManualVerification &&
                                                !registerSuccess && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowManualVerification(
                                                                false
                                                            );
                                                            setRegistrationOtp(
                                                                ""
                                                            );
                                                        }}
                                                    >
                                                        Quay lại đăng ký
                                                    </Button>
                                                )}
                                        </>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="lg"
                                            icon={KeyRound}
                                            onClick={continueToLogin}
                                        >
                                            Đăng nhập ngay
                                        </Button>
                                    )}
                                </form>
                            )}
                        </>
                    )}

                    {mode === "reset" && (
                        <>
                            <StatusBanner
                                success={passwordResetNotice}
                                errors={passwordResetError}
                            />

                            <form onSubmit={handleRequestReset} style={{ display: "grid", gap: 16 }}>
                                <FormField label="Email nhận mã xác minh" required error={resetErrors.email}>
                                    <Input
                                        icon={Mail}
                                        type="email"
                                        placeholder="user@example.com"
                                        value={resetForm.email}
                                        onChange={(event) => updateResetField("email", event.target.value)}
                                        disabled={passwordResetLoading}
                                        autoComplete="email"
                                    />
                                </FormField>

                                <Button
                                    type="submit"
                                    variant="secondary"
                                    loading={requestingPasswordReset}
                                    disabled={passwordResetLoading}
                                >
                                    Gửi email xác minh
                                </Button>
                            </form>

                            <form onSubmit={handleVerifyReset} style={{ display: "grid", gap: 16, marginTop: 18 }}>
                                <FormField label="OTP trong email" error={resetErrors.otp}>
                                    <Input
                                        placeholder="Nhập 6 số OTP hoặc dùng link trong email"
                                        value={resetForm.otp}
                                        onChange={(event) => updateResetField("otp", event.target.value)}
                                        disabled={passwordResetLoading}
                                        inputMode="numeric"
                                        maxLength={6}
                                    />
                                </FormField>

                                {resetForm.token && (
                                    <div className="soft-panel">
                                        <strong>Link xác minh đã sẵn sàng</strong>
                                        <p className="section-copy">Bạn có thể đổi mật khẩu bằng link trong email hoặc nhập OTP.</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant={passwordResetVerified ? "outline" : "primary"}
                                    loading={verifyingPasswordReset}
                                    disabled={passwordResetLoading || passwordResetVerified}
                                >
                                    {passwordResetVerified ? "Đã xác minh mã" : "Kiểm tra mã xác minh"}
                                </Button>
                            </form>

                            <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 16, marginTop: 18 }}>
                                <FormField label="Mật khẩu mới" required error={resetErrors.password}>
                                    <Input
                                        icon={Lock}
                                        type={showResetPassword ? "text" : "password"}
                                        placeholder="Ít nhất 6 ký tự"
                                        value={resetForm.password}
                                        onChange={(event) => updateResetField("password", event.target.value)}
                                        disabled={passwordResetLoading}
                                        autoComplete="new-password"
                                        rightElement={passwordToggle(
                                            showResetPassword,
                                            () => setShowResetPassword((value) => !value),
                                            showResetPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"
                                        )}
                                    />
                                </FormField>

                                <FormField label="Nhập lại mật khẩu mới" required error={resetErrors.confirmPassword}>
                                    <Input
                                        icon={Lock}
                                        type={showResetPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={resetForm.confirmPassword}
                                        onChange={(event) => updateResetField("confirmPassword", event.target.value)}
                                        disabled={passwordResetLoading}
                                        autoComplete="new-password"
                                    />
                                </FormField>

                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={changingPassword}
                                    disabled={passwordResetLoading || !passwordResetVerified}
                                    icon={KeyRound}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </form>
                        </>
                    )}

                </div>
            </main >
        </div >
    );
};

export default Login;
