/**
 * @fileoverview Xây dựng màn hình UserProfilePage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Car, KeyRound, MailCheck, Plus, Save, Trash2, User } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  confirmProfileUpdateRequest,
  requestProfileUpdateOtpRequest,
} from "../backend/auth/authSlice";
import {
  clearParkingNotice,
  createVehicleRequest,
  fetchMyVehiclesRequest,
} from "../backend/parking/parkingSlice";
import { formatDate, getStatusLabel, getStatusTone, getVehicleTypeLabel } from "../../services/mockParkingData";
import { compressImageFile } from "../../utils/imageFile";
import {
  isValidOptionalVietnamPhone,
  sanitizeVietnamPhoneInput,
  VIETNAM_PHONE_ERROR,
} from "../../utils/phone";

/**
 * Tạo nghiệp vụ `createVehicleForm` (create vehicle form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function createVehicleForm
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const createVehicleForm = () => ({
  plateNumber: "",
  vehicleType: "MOTORBIKE",
  brand: "",
  color: "",
  plateImageUrl: "",
  vehiclePortraitImageUrl: "",
  vehicleLandscapeImageUrl: "",
});

/**
 * Tạo nghiệp vụ `createVehicleImageState` (create vehicle image state). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function createVehicleImageState
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const createVehicleImageState = () => ({
  plateImageUrl: { error: "", fileName: "", processing: false },
  vehiclePortraitImageUrl: { error: "", fileName: "", processing: false },
  vehicleLandscapeImageUrl: { error: "", fileName: "", processing: false },
});

/**
 * Thực hiện nghiệp vụ `VehiclePhotoCapture` (vehicle photo capture). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function VehiclePhotoCapture
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const VehiclePhotoCapture = ({
  buttonLabel,
  completeLabel,
  error,
  fileName,
  guidance,
  label,
  onFileSelected,
  onRemove,
  processing,
  value,
}) => {
  const inputRef = useRef(null);

  return (
    <div className="vehicle-photo-field">
      <div className="form-label">
        {label} <span className="label-required">*</span>
      </div>
      <input
        ref={inputRef}
        className="visually-hidden-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          onFileSelected(file);
        }}
      />

      {value ? (
        <div className="vehicle-photo-preview">
          <img src={value} alt={label} />
          <div className="vehicle-photo-preview-info">
            <strong>{completeLabel}</strong>
            <span>{fileName || "Ảnh vừa chụp"}</span>
            <div className="action-row">
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={Camera}
                onClick={() => inputRef.current?.click()}
              >
                Chụp lại
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                icon={Trash2}
                onClick={onRemove}
              >
                Xóa ảnh
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="vehicle-camera-button"
          disabled={processing}
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={28} />
          <span>{processing ? "Đang chuẩn bị ảnh..." : buttonLabel}</span>
          <small>{guidance}</small>
        </button>
      )}
      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
};

/**
 * Thực hiện nghiệp vụ `UserProfilePage` (user profile page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function UserProfilePage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { user: mockUser } = useMockAuth();
  const {
    error: authError,
    frontendRole,
    loading: authLoading,
    profileUpdateNotice,
    profileUpdateRequestId,
    user: authUser,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.auth);
  const user = authUser || mockUser;
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { vehicles, notice } = useSelector((state) => state.parking);
  const isResident = (frontendRole || user?.role || "USER") === "USER";
  const [profileForm, setProfileForm] = useState({
    avatarCropX: Number(user?.avatarCropX ?? 50),
    avatarCropY: Number(user?.avatarCropY ?? 50),
    avatarCropZoom: Number(user?.avatarCropZoom ?? 1),
    name: user?.name || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || user?.avatar || "",
  });
  const [profileOtp, setProfileOtp] = useState("");
  const [profilePhoneError, setProfilePhoneError] = useState("");
  const displayAvatar = profileForm.avatarUrl || user?.avatarUrl || user?.avatar || "";
  const vehicleSubmissionRef = useRef(false);
  const [vehicleImages, setVehicleImages] = useState(createVehicleImageState);
  const [form, setForm] = useState(createVehicleForm);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (isResident) {
      dispatch(fetchMyVehiclesRequest());
    }
  }, [dispatch, isResident]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const timer = window.setTimeout(() => {
      setProfileForm({
        avatarCropX: Number(user?.avatarCropX ?? 50),
        avatarCropY: Number(user?.avatarCropY ?? 50),
        avatarCropZoom: Number(user?.avatarCropZoom ?? 1),
        name: user?.name || "",
        phone: user?.phone || "",
        avatarUrl: user?.avatarUrl || user?.avatar || "",
      });
    }, 0);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => window.clearTimeout(timer);
  }, [user?.avatar, user?.avatarCropX, user?.avatarCropY, user?.avatarCropZoom, user?.avatarUrl, user?.name, user?.phone]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!profileUpdateRequestId && profileUpdateNotice === "Cập nhật hồ sơ thành công.") {
      setProfileOtp("");
    }
  }, [profileUpdateNotice, profileUpdateRequestId]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!vehicleSubmissionRef.current || vehicles.saving) return undefined;

    if (notice === "Đã gửi hồ sơ xe để chờ duyệt.") {
      vehicleSubmissionRef.current = false;
      /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      const timer = window.setTimeout(() => {
        setForm(createVehicleForm());
        setVehicleImages(createVehicleImageState());
      }, 0);

      /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      return () => window.clearTimeout(timer);
    }

    if (vehicles.error) {
      vehicleSubmissionRef.current = false;
    }

    return undefined;
  }, [notice, vehicles.error, vehicles.saving]);

  /**
   * Cập nhật nghiệp vụ `updateForm` (update form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSubmit
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const missingImages = {
      plateImageUrl: "Vui lòng chụp rõ biển số xe.",
      vehiclePortraitImageUrl: "Vui lòng chụp xe theo chiều dọc thân xe.",
      vehicleLandscapeImageUrl: "Vui lòng chụp ngang thân xe từ bên hông.",
    };
    /* Callback nội bộ của lời gọi `every`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const hasAllImages = Object.keys(missingImages).every((field) => form[field]);

    if (!form.plateNumber.trim() || !form.brand.trim() || !hasAllImages) {
      /* Callback nội bộ của lời gọi `setVehicleImages`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setVehicleImages((prev) => Object.fromEntries(
        /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        Object.entries(prev).map(([field, state]) => [
          field,
          {
            ...state,
            error: form[field] ? state.error : missingImages[field],
          },
        ])
      ));
      return;
    }

    vehicleSubmissionRef.current = true;
    dispatch(
      createVehicleRequest({
        plateNumber: form.plateNumber.trim().toUpperCase(),
        vehicleType: form.vehicleType,
        brand: form.brand.trim(),
        color: form.color.trim() || "Chưa cập nhật",
        plateImageUrl: form.plateImageUrl,
        vehiclePortraitImageUrl: form.vehiclePortraitImageUrl,
        vehicleLandscapeImageUrl: form.vehicleLandscapeImageUrl,
        buildingId: user?.buildingId || undefined,
      })
    );
  };

  /**
   * Xử lý nghiệp vụ `handleVehicleImageChange` (handle vehicle image change). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleVehicleImageChange
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} file - Giá trị `file` được hàm sử dụng trong quá trình xử lý.
   * @returns {Promise<*>} Promise chứa kết quả khi toàn bộ thao tác bất đồng bộ hoàn tất.
   */
  const handleVehicleImageChange = async (field, file) => {
    if (!file) return;

    dispatch(clearParkingNotice());
    /* Callback nội bộ của lời gọi `setVehicleImages`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setVehicleImages((prev) => ({
      ...prev,
      [field]: { ...prev[field], error: "", processing: true },
    }));

    try {
      const imageUrl = await compressImageFile(file);
      /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setForm((prev) => ({ ...prev, [field]: imageUrl }));
      /* Callback nội bộ của lời gọi `setVehicleImages`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setVehicleImages((prev) => ({
        ...prev,
        [field]: {
          error: "",
          fileName: file.name || "Ảnh vừa chụp",
          processing: false,
        },
      }));
    } catch (error) {
      /* Callback nội bộ của lời gọi `setVehicleImages`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setVehicleImages((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          error: error.message || "Không chuẩn bị được ảnh xe.",
          processing: false,
        },
      }));
    } finally {
      /* Callback nội bộ của lời gọi `setVehicleImages`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setVehicleImages((prev) => ({
        ...prev,
        [field]: { ...prev[field], processing: false },
      }));
    }
  };

  /**
   * Xóa hoặc đặt lại nghiệp vụ `removeVehicleImage` (remove vehicle image). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function removeVehicleImage
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const removeVehicleImage = (field) => {
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((prev) => ({ ...prev, [field]: "" }));
    /* Callback nội bộ của lời gọi `setVehicleImages`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setVehicleImages((prev) => ({
      ...prev,
      [field]: { error: "", fileName: "", processing: false },
    }));
  };

  /**
   * Cập nhật nghiệp vụ `updateProfileForm` (update profile form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateProfileForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateProfileForm = (field, value) => {
    const nextValue =
      field === "phone" ? sanitizeVietnamPhoneInput(value) : value;

    if (field === "phone") {
      setProfilePhoneError("");
    }

    /* Callback nội bộ của lời gọi `setProfileForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setProfileForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  /**
   * Xử lý nghiệp vụ `handleProfileSubmit` (handle profile submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleProfileSubmit
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleProfileSubmit = (event) => {
    event.preventDefault();

    if (!isValidOptionalVietnamPhone(profileForm.phone)) {
      setProfilePhoneError(VIETNAM_PHONE_ERROR);
      return;
    }

    setProfilePhoneError("");
    dispatch(
      requestProfileUpdateOtpRequest({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
        avatarUrl: profileForm.avatarUrl.trim() || undefined,
        avatarCropX: Number(profileForm.avatarCropX),
        avatarCropY: Number(profileForm.avatarCropY),
        avatarCropZoom: Number(profileForm.avatarCropZoom),
      })
    );
    setProfileOtp("");
  };

  /**
   * Xử lý nghiệp vụ `handleConfirmProfileUpdate` (handle confirm profile update). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleConfirmProfileUpdate
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleConfirmProfileUpdate = () => {
    dispatch(
      confirmProfileUpdateRequest({
        requestId: profileUpdateRequestId,
        otp: profileOtp.trim(),
      })
    );
  };

  /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const isProcessingVehicleImage = Object.values(vehicleImages).some((image) => image.processing);
  const hasAllVehicleImages = [
    form.plateImageUrl,
    form.vehiclePortraitImageUrl,
    form.vehicleLandscapeImageUrl,
  ].every(Boolean);

  const columns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "Hãng xe", key: "brand" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Màu xe", key: "color", render: (row) => row.color || "-" },
    {
      header: "Hồ sơ ảnh",
      key: "vehicleImages",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => {
        const imageCount = [
          row.plateImageUrl,
          row.vehiclePortraitImageUrl,
          row.vehicleLandscapeImageUrl,
        ].filter(Boolean).length;

        return (
          <span className={`pill ${imageCount === 3 ? "success" : "warning"}`}>
            {imageCount === 3 ? "Đủ 3 ảnh" : `${imageCount}/3 ảnh`}
          </span>
        );
      },
    },
    {
      header: "Trạng thái",
      key: "status",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><User size={16} /> Hồ sơ cá nhân</div>
          <h1 className="page-title">Thông tin tài khoản và ảnh đại diện</h1>
          <p className="page-subtitle">
            Cập nhật tên, số điện thoại và link ảnh đại diện. Email và vai trò được giữ nguyên theo tài khoản đã duyệt.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tài khoản</span>
          <span className="page-hero-number">#{user.id}</span>
          <span className="page-hero-label">{user.email}</span>
        </div>
      </section>

      <StatusBanner success={[notice, profileUpdateNotice]} errors={[vehicles.error, authError]} />

      <div className={isResident ? "two-column-grid" : "dashboard-grid"}>
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><User size={19} /> Hồ sơ cá nhân</h2>
              <p className="section-copy">Ảnh được lưu bằng đường dẫn ngắn để hệ thống tải nhanh và không làm đầy cơ sở dữ liệu.</p>
            </div>
          </div>
          <form className="data-list" onSubmit={handleProfileSubmit}>
            <div className="profile-avatar-panel">
              {displayAvatar ? (
                <span className="profile-avatar-large profile-avatar-crop-frame">
                  <img
                    src={displayAvatar}
                    alt={user.name}
                    style={{
                      objectPosition: `${profileForm.avatarCropX}% ${profileForm.avatarCropY}%`,
                      transform: `scale(${profileForm.avatarCropZoom})`,
                    }}
                  />
                </span>
              ) : (
                <div className="profile-avatar-large profile-avatar-placeholder">
                  {String(user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <strong>Ảnh đại diện</strong>
                <p className="section-copy">Dán link ảnh từ nơi lưu ảnh của bạn. Ảnh sẽ được cắt vừa khung tròn khi hiển thị.</p>
              </div>
            </div>

            <FormField label="Họ tên" required>
              <Input
                value={profileForm.name}
                onChange={(event) => updateProfileForm("name", event.target.value)}
                placeholder="Nhập họ tên"
              />
            </FormField>
            <FormField label="Số điện thoại" error={profilePhoneError}>
              <Input
                value={profileForm.phone}
                onChange={(event) => updateProfileForm("phone", event.target.value)}
                placeholder="Ví dụ: 0901234567"
                inputMode="numeric"
                maxLength={10}
              />
            </FormField>
            <FormField label="Link ảnh đại diện">
              <Input
                value={profileForm.avatarUrl}
                onChange={(event) => updateProfileForm("avatarUrl", event.target.value)}
                placeholder="https://..."
              />
            </FormField>
            {displayAvatar && (
              <div className="avatar-crop-controls">
                <FormField label="Dịch ngang ảnh">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={profileForm.avatarCropX}
                    onChange={(event) => updateProfileForm("avatarCropX", event.target.value)}
                  />
                </FormField>
                <FormField label="Dịch dọc ảnh">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={profileForm.avatarCropY}
                    onChange={(event) => updateProfileForm("avatarCropY", event.target.value)}
                  />
                </FormField>
                <FormField label="Phóng ảnh">
                  <Input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={profileForm.avatarCropZoom}
                    onChange={(event) => updateProfileForm("avatarCropZoom", event.target.value)}
                  />
                </FormField>
              </div>
            )}
            <div className="data-row"><span>Email</span><strong>{user.email}</strong></div>
            <div className="data-row"><span>Tòa nhà</span><strong>{user.buildingName || "Chưa có tòa nhà"}</strong></div>
            <div className="data-row"><span>Ngày tham gia</span><strong>{formatDate(user.createdAt || "2026-06-01")}</strong></div>
            <Button type="submit" variant="primary" icon={MailCheck} loading={authLoading}>
              Gửi mã xác minh
            </Button>
            {profileUpdateRequestId && (
              <div className="soft-panel">
                <FormField label="Mã xác minh email" required>
                  <Input
                    value={profileOtp}
                    onChange={(event) => setProfileOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Nhập 6 số trong email"
                    icon={KeyRound}
                  />
                </FormField>
                <Button
                  type="button"
                  variant="primary"
                  icon={Save}
                  loading={authLoading}
                  disabled={profileOtp.length !== 6}
                  onClick={handleConfirmProfileUpdate}
                >
                  Xác nhận lưu hồ sơ
                </Button>
              </div>
            )}
          </form>
        </section>

        {isResident && (
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Plus size={19} /> Đăng ký xe mới</h2>
              <p className="section-copy">Hồ sơ xe sẽ chuyển sang trạng thái chờ duyệt.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <FormField label="Biển số xe" required>
              <Input
                required
                value={form.plateNumber}
                onChange={(event) => updateForm("plateNumber", event.target.value)}
                placeholder="VD: 59S1-123.45"
              />
            </FormField>
            <FormField label="Loại xe">
              <Select
                value={form.vehicleType}
                onChange={(event) => updateForm("vehicleType", event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="Hãng xe" required>
              <Input
                required
                value={form.brand}
                onChange={(event) => updateForm("brand", event.target.value)}
                placeholder="Honda, Mazda..."
              />
            </FormField>
            <FormField label="Màu xe">
              <Input value={form.color} onChange={(event) => updateForm("color", event.target.value)} placeholder="Trắng, đen, bạc..." />
            </FormField>
            <div className="vehicle-photo-stack">
              <VehiclePhotoCapture
                label="Ảnh biển số xe"
                buttonLabel="Chụp ảnh biển số"
                completeLabel="Đã có ảnh biển số"
                guidance="Đặt biển số ngay ngắn, đủ sáng và nhìn rõ toàn bộ ký tự."
                value={form.plateImageUrl}
                fileName={vehicleImages.plateImageUrl.fileName}
                error={vehicleImages.plateImageUrl.error}
                processing={vehicleImages.plateImageUrl.processing}
                onFileSelected={(file) => handleVehicleImageChange("plateImageUrl", file)}
                onRemove={() => removeVehicleImage("plateImageUrl")}
              />
              <VehiclePhotoCapture
                label="Ảnh xe theo chiều dọc thân xe"
                buttonLabel="Chụp xe theo góc dọc"
                completeLabel="Đã có ảnh góc dọc thân xe"
                guidance="Chụp từ đầu hoặc đuôi xe theo hướng dọc thân xe và lấy trọn hình dáng xe. Không cần xoay điện thoại."
                value={form.vehiclePortraitImageUrl}
                fileName={vehicleImages.vehiclePortraitImageUrl.fileName}
                error={vehicleImages.vehiclePortraitImageUrl.error}
                processing={vehicleImages.vehiclePortraitImageUrl.processing}
                onFileSelected={(file) => handleVehicleImageChange("vehiclePortraitImageUrl", file)}
                onRemove={() => removeVehicleImage("vehiclePortraitImageUrl")}
              />
              <VehiclePhotoCapture
                label="Ảnh xe nhìn ngang thân xe"
                buttonLabel="Chụp xe từ bên hông"
                completeLabel="Đã có ảnh góc ngang thân xe"
                guidance="Đứng bên hông và chụp trọn thân xe theo chiều ngang. Ảnh này không bắt buộc nhìn thấy biển số."
                value={form.vehicleLandscapeImageUrl}
                fileName={vehicleImages.vehicleLandscapeImageUrl.fileName}
                error={vehicleImages.vehicleLandscapeImageUrl.error}
                processing={vehicleImages.vehicleLandscapeImageUrl.processing}
                onFileSelected={(file) => handleVehicleImageChange("vehicleLandscapeImageUrl", file)}
                onRemove={() => removeVehicleImage("vehicleLandscapeImageUrl")}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={vehicles.saving}
              disabled={isProcessingVehicleImage || !hasAllVehicleImages}
            >
              Gửi hồ sơ chờ duyệt
            </Button>
          </form>
        </section>
        )}
      </div>

      {isResident && (
      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Danh sách phương tiện</h2>
            <p className="section-copy">Xe đã duyệt mới được mua gói tháng và dùng mã QR hợp lệ.</p>
          </div>
        </div>
        <Table columns={columns} data={vehicles.mine} loading={vehicles.loading} />
      </section>
      )}
    </div>
  );
};

export default UserProfilePage;
