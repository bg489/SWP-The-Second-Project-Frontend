import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Car,
    KeyRound,
    Lock,
    Mail,
    Moon,
    QrCode,
    Sparkles,
    Sun,
} from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import { useMockAuth } from "../../../context/MockAuthContext";
import {
    clearRegisterState,
    fetchRegisterBuildingsRequest,
    loginRequest,
    registerRequest,
} from "../auth/authSlice";
import {
    buildingInfo,
    floors,
    roleHomePaths,
    roleLabels,
} from "../../../services/mockParkingData";


const demoAccounts = [
    { label: "Quản trị viên", email: "admin@test.com" },
    { label: "Quản lý", email: "manager@test.com" },
    { label: "Nhân viên", email: "staff@test.com" },
    { label: "Cư dân", email: "user1@test.com" },
];

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { login, isDarkMode, toggleDarkMode } = useMockAuth();

    const [mode, setMode] = useState("login");

    const [registerForm, setRegisterForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        buildingId: "",
    });

    const [registerErrors, setRegisterErrors] = useState({});

    const {
        loading,
        error,
        loginCompleted,
        frontendRole,
        user,
        token,
        registerLoading,
        registerError,
        registerSuccess,
        registerBuildings,
        registerBuildingsLoading,
        registerBuildingsError,
    } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchRegisterBuildingsRequest());
    }, [dispatch]);

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setErrors({});
        setRegisterErrors({});
        dispatch(clearRegisterState());
    };

    const updateRegisterField = (field, value) => {
        setRegisterForm((prev) => ({
            ...prev,
            [field]: value,
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

        if (registerForm.phone.trim() && !/^[0-9]{9,11}$/.test(registerForm.phone.trim())) {
            nextErrors.phone = "Số điện thoại nên có 9-11 chữ số.";
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

        dispatch(registerRequest(payload));
    };

    const [form, setForm] = useState({
        emailOrPhone: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const motorbikeCapacity = useMemo(() => {
        return floors
            .filter((floor) => floor.floorType === "MOTORBIKE")
            .reduce((sum, floor) => sum + Number(floor.capacity || 0), 0);
    }, []);

    const carSlots = useMemo(() => {
        return floors.find((floor) => floor.floorType === "CAR")?.slotsCount || 0;
    }, []);

    useEffect(() => {
        if (!loginCompleted || !token) return;

        const role = frontendRole || "USER";

        login(role, user, token);

        navigate(roleHomePaths[role] || "/user/dashboard", {
            replace: true,
        });
    }, [loginCompleted, token, frontendRole, user, login, navigate]);

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

    const fillDemoAccount = (email) => {
        setForm({
            emailOrPhone: email,
            password: "123456",
        });

        setErrors({});
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

                <div className="soft-panel">
                    <div className="section-title">
                        <Building2 size={19} /> {buildingInfo.name}
                    </div>

                    <div className="data-list" style={{ marginTop: 14 }}>
                        <div className="data-row">
                            <span>Địa chỉ</span>
                            <strong>{buildingInfo.address}</strong>
                        </div>

                        <div className="data-row">
                            <span>Sức chứa xe máy</span>
                            <strong>{motorbikeCapacity} xe</strong>
                        </div>

                        <div className="data-row">
                            <span>Ô đỗ ô tô</span>
                            <strong>{carSlots} ô</strong>
                        </div>
                    </div>
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                        <Button
                            type="button"
                            variant={mode === "login" ? "primary" : "outline"}
                            onClick={() => switchMode("login")}
                            disabled={loading || registerLoading}
                        >
                            Đăng nhập
                        </Button>

                        <Button
                            type="button"
                            variant={mode === "register" ? "primary" : "outline"}
                            onClick={() => switchMode("register")}
                            disabled={loading || registerLoading}
                        >
                            Đăng ký
                        </Button>
                    </div>

                    <StatusBanner errors={error} />

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
                                        placeholder="admin@test.com"
                                        value={form.emailOrPhone}
                                        onChange={(event) =>
                                            updateField("emailOrPhone", event.target.value)
                                        }
                                        disabled={loading}
                                        autoComplete="username"
                                    />
                                </FormField>

                                <FormField label="Mật khẩu" required error={errors.password}>
                                    <Input
                                        icon={Lock}
                                        type="password"
                                        placeholder="••••••"
                                        value={form.password}
                                        onChange={(event) =>
                                            updateField("password", event.target.value)
                                        }
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />
                                </FormField>

                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={loading}
                                    disabled={loading}
                                    icon={KeyRound}
                                >
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </Button>
                            </form>

                        </>
                    )}

                    {mode === "register" && (
                        <>
                            <StatusBanner
                                success={registerSuccess ? "??ng k? th?nh c?ng. T?i kho?n ?ang ch? qu?n tr? vi?n duy?t tr??c khi ??ng nh?p." : null}
                                errors={registerError}
                            />

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

                                <FormField label="Số điện thoại" error={registerErrors.phone}>
                                    <Input
                                        placeholder="0901234567"
                                        value={registerForm.phone}
                                        onChange={(event) => updateRegisterField("phone", event.target.value)}
                                        disabled={registerLoading}
                                        autoComplete="tel"
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
                                        type="password"
                                        placeholder="Ít nhất 6 ký tự"
                                        value={registerForm.password}
                                        onChange={(event) =>
                                            updateRegisterField("password", event.target.value)
                                        }
                                        disabled={registerLoading}
                                        autoComplete="new-password"
                                    />
                                </FormField>

                                <FormField
                                    label="Nhập lại mật khẩu"
                                    required
                                    error={registerErrors.confirmPassword}
                                >
                                    <Input
                                        icon={Lock}
                                        type="password"
                                        placeholder="Nhập lại mật khẩu"
                                        value={registerForm.confirmPassword}
                                        onChange={(event) =>
                                            updateRegisterField("confirmPassword", event.target.value)
                                        }
                                        disabled={registerLoading}
                                        autoComplete="new-password"
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
                            </form>
                        </>
                    )}

                    {mode === "login" && (
                        <>

                            <div className="soft-panel" style={{ marginTop: 18 }}>
                                <div className="section-title" style={{ fontSize: 15 }}>
                                    Tài khoản dùng thử
                                </div>

                                <p className="section-copy">
                                    Mật khẩu mặc định: <strong>123456</strong>
                                </p>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {demoAccounts.map((account) => (
                                        <Button
                                            key={account.email}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={loading}
                                            onClick={() => fillDemoAccount(account.email)}
                                        >
                                            {account.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>




                            <div className="data-list" style={{ marginTop: 18 }}>
                                <div className="data-row">
                                    <span>Quản trị viên</span>
                                    <strong>{roleLabels.ADMIN}</strong>
                                </div>

                                <div className="data-row">
                                    <span>Quản lý</span>
                                    <strong>{roleLabels.PARKING_MANAGER}</strong>
                                </div>

                                <div className="data-row">
                                    <span>Nhân viên</span>
                                    <strong>{roleLabels.PARKING_STAFF}</strong>
                                </div>

                                <div className="data-row">
                                    <span>Cư dân</span>
                                    <strong>{roleLabels.USER}</strong>
                                </div>
                            </div>

                        </>
                    )}
                </div>
            </main >
        </div >
    );
};

export default Login;
