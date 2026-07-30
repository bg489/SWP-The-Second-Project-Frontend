import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarClock,
  Camera,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  Layers3,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import PlateCameraScanner from "../../components/PlateScanner/PlateCameraScanner";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import {
  clearParkingNotice,
  createGuestHourlyReservationRequest,
  createUserHourlyReservationRequest,
  fetchHourlyReservationAvailabilityRequest,
  fetchMyHourlyReservationsRequest,
  fetchMyVehiclesRequest,
  fetchStaffHourlyReservationsRequest,
} from "../backend/parking/parkingSlice";
import { formatCurrency } from "../../services/mockParkingData";
import {
  clearPaymentReturnState,
  getPaymentReturnFromUrl,
} from "../../utils/paymentReturn";
import {
  isValidOptionalVietnamPhone,
  sanitizeVietnamPhoneInput,
  VIETNAM_PHONE_ERROR,
} from "../../utils/phone";
import "./HourlySlotReservationsPage.css";

const reservationStatusMeta = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "warning" },
  BOOKED: { label: "Đã đặt", tone: "success" },
  CHECKED_IN: { label: "Xe đang gửi", tone: "info" },
  COMPLETED: { label: "Đã trả xe", tone: "neutral" },
  EXPIRED: { label: "Đã hết giờ", tone: "neutral" },
  CANCELLED: { label: "Đã hủy", tone: "danger" },
};

const paymentStatusMeta = {
  PENDING: { label: "Chờ thanh toán", tone: "warning" },
  PAID: { label: "Đã thanh toán", tone: "success" },
  FAILED: { label: "Thanh toán thất bại", tone: "danger" },
};

const pad = (value) => String(value).padStart(2, "0");

const toLocalDateTimeInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;

const createDefaultPeriod = () => {
  const start = new Date(Date.now() + 30 * 60 * 1000);

  start.setSeconds(0, 0);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15);

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  if (end.getDate() !== start.getDate()) {
    start.setDate(start.getDate() + 1);
    start.setHours(8, 0, 0, 0);
    end.setTime(start.getTime() + 60 * 60 * 1000);
  }

  return {
    startAt: toLocalDateTimeInput(start),
    endAt: toLocalDateTimeInput(end),
  };
};

const createReservationBounds = () => {
  const minimum = new Date();
  const maximum = new Date();

  minimum.setSeconds(0, 0);
  maximum.setMonth(maximum.getMonth() + 2);
  maximum.setSeconds(59, 999);

  return {
    maximum,
    maximumInput: toLocalDateTimeInput(maximum),
    minimum,
    minimumInput: toLocalDateTimeInput(minimum),
  };
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const HourlySlotReservationsPage = () => {
  const dispatch = useDispatch();
  const { role, user: contextUser } = useMockAuth();
  const authUser = useSelector((state) => state.auth.user);
  const user = authUser || contextUser;
  const isStaff = role === "PARKING_STAFF";
  const buildingId = user?.buildingId || user?.building_id;
  const { hourlyReservations, vehicles, notice } = useSelector(
    (state) => state.parking
  );
  const [period, setPeriod] = useState(createDefaultPeriod);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [guestForm, setGuestForm] = useState({
    guestName: "",
    guestPhone: "",
    plateNumber: "",
    paymentMethod: "CASH",
    note: "",
  });
  const [formError, setFormError] = useState("");
  const [guestPhoneError, setGuestPhoneError] = useState("");
  const [plateScannerOpen, setPlateScannerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentReturn] = useState(() =>
    getPaymentReturnFromUrl({
      successMessage: "Thanh toán thành công. Ô đỗ đã được giữ theo khung giờ đã chọn.",
      failureMessage: "Thanh toán chưa hoàn tất. Ô đỗ chưa được xác nhận giữ chỗ.",
    })
  );

  useEffect(() => {
    if (isStaff) {
      dispatch(
        fetchStaffHourlyReservationsRequest(
          buildingId ? { buildingId } : undefined
        )
      );
    } else {
      dispatch(fetchMyHourlyReservationsRequest());
      dispatch(fetchMyVehiclesRequest());
    }
  }, [buildingId, dispatch, isStaff]);

  useEffect(() => {
    if (!paymentReturn) return;

    if (isStaff) {
      dispatch(
        fetchStaffHourlyReservationsRequest(
          buildingId ? { buildingId } : undefined
        )
      );
    } else {
      dispatch(fetchMyHourlyReservationsRequest());
    }
    clearPaymentReturnState();
  }, [buildingId, dispatch, isStaff, paymentReturn]);

  const approvedCars = useMemo(
    () =>
      vehicles.mine.filter(
        (vehicle) =>
          vehicle.vehicleType === "CAR" &&
          ["APPROVED", "ACTIVE"].includes(vehicle.status) &&
          (!buildingId ||
            !vehicle.buildingId ||
            Number(vehicle.buildingId) === Number(buildingId))
      ),
    [buildingId, vehicles.mine]
  );

  const effectiveVehicleId =
    vehicleId || (approvedCars[0]?.id ? String(approvedCars[0].id) : "");

  const reservations = isStaff
    ? hourlyReservations.staffItems
    : hourlyReservations.mine;
  const filteredReservations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesStatus =
        !statusFilter || reservation.status === statusFilter;
      const matchesSearch =
        !keyword ||
        [
          reservation.reservationCode,
          reservation.plateNumber,
          reservation.userName,
          reservation.guestName,
          reservation.guestPhone,
          reservation.slotCode,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      return matchesStatus && matchesSearch;
    });
  }, [reservations, search, statusFilter]);

  const availableSlots = useMemo(
    () => hourlyReservations.availability.slots || [],
    [hourlyReservations.availability.slots]
  );
  const slotsByFloor = useMemo(() => {
    const groups = new Map();

    availableSlots.forEach((slot) => {
      const key = String(slot.floorId || slot.floorName || "unknown");
      const current = groups.get(key) || {
        floorId: slot.floorId,
        floorName: slot.floorName || "Tầng chưa xác định",
        slots: [],
      };

      current.slots.push(slot);
      groups.set(key, current);
    });

    return Array.from(groups.values());
  }, [availableSlots]);
  const reservationBounds = createReservationBounds();
  const selectedSlot = availableSlots.find(
    (slot) => String(slot.id) === String(selectedSlotId)
  );
  const activeReservations = reservations.filter((item) =>
    ["PENDING_PAYMENT", "BOOKED", "CHECKED_IN"].includes(item.status)
  ).length;

  const buildPeriodPayload = () => {
    const startAt = new Date(period.startAt);
    const endAt = new Date(period.endAt);

    if (
      !period.startAt ||
      !period.endAt ||
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime())
    ) {
      setFormError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.");
      return null;
    }

    if (endAt <= startAt) {
      setFormError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return null;
    }

    const { maximum, minimum } = createReservationBounds();

    if (startAt < minimum) {
      setFormError("Thời gian bắt đầu không được nằm trong quá khứ.");
      return null;
    }

    if (startAt > maximum || endAt > maximum) {
      setFormError("Bạn chỉ có thể đặt ô trước tối đa 2 tháng.");
      return null;
    }

    if (startAt.toDateString() !== endAt.toDateString()) {
      setFormError("Lượt đặt ô phải bắt đầu và kết thúc trong cùng một ngày.");
      return null;
    }

    return {
      buildingId: buildingId ? Number(buildingId) : undefined,
      endAt: endAt.toISOString(),
      startAt: startAt.toISOString(),
    };
  };

  const handlePeriodChange = (field, value) => {
    dispatch(clearParkingNotice());
    setFormError("");
    setSelectedSlotId("");
    setPeriod((current) => ({ ...current, [field]: value }));
  };

  const handleCheckAvailability = () => {
    const payload = buildPeriodPayload();

    if (!payload) return;

    dispatch(clearParkingNotice());
    setSelectedSlotId("");
    dispatch(fetchHourlyReservationAvailabilityRequest(payload));
  };

  const resetGuestForm = () => {
    setGuestForm({
      guestName: "",
      guestPhone: "",
      plateNumber: "",
      paymentMethod: "CASH",
      note: "",
    });
    setPlateScannerOpen(false);
    setSelectedSlotId("");
    setGuestPhoneError("");
  };

  const markGuestSubmitted = useResetAfterSuccess({
    submitting: hourlyReservations.creatingGuest,
    success: notice,
    error: hourlyReservations.error,
    onSuccess: resetGuestForm,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const timePayload = buildPeriodPayload();

    if (!timePayload) return;

    if (!selectedSlotId || !selectedSlot?.isAvailable) {
      setFormError("Vui lòng chọn một ô đỗ còn trống trong khung giờ này.");
      return;
    }

    dispatch(clearParkingNotice());
    setFormError("");

    if (isStaff) {
      if (
        !guestForm.guestName.trim() ||
        !guestForm.guestPhone.trim() ||
        !guestForm.plateNumber.trim()
      ) {
        setFormError(
          "Vui lòng nhập tên khách, số điện thoại và biển số xe."
        );
        return;
      }

      if (!isValidOptionalVietnamPhone(guestForm.guestPhone)) {
        setGuestPhoneError(VIETNAM_PHONE_ERROR);
        return;
      }

      setGuestPhoneError("");
      markGuestSubmitted();
      dispatch(
        createGuestHourlyReservationRequest({
          ...timePayload,
          ...guestForm,
          guestName: guestForm.guestName.trim(),
          guestPhone: guestForm.guestPhone.trim(),
          plateNumber: guestForm.plateNumber.trim().toUpperCase(),
          slotId: Number(selectedSlotId),
        })
      );
      return;
    }

    if (!effectiveVehicleId) {
      setFormError("Bạn cần chọn một ô tô đã được duyệt.");
      return;
    }

    dispatch(
      createUserHourlyReservationRequest({
        ...timePayload,
        slotId: Number(selectedSlotId),
        vehicleId: Number(effectiveVehicleId),
      })
    );
  };

  const refresh = () => {
    dispatch(clearParkingNotice());
    if (isStaff) {
      dispatch(
        fetchStaffHourlyReservationsRequest(
          buildingId ? { buildingId } : undefined
        )
      );
    } else {
      dispatch(fetchMyHourlyReservationsRequest());
    }
  };

  const columns = [
    {
      header: "Mã đặt chỗ",
      key: "reservationCode",
      render: (row) => (
        <div className="reservation-code-cell">
          <strong>{row.reservationCode}</strong>
          <span>{row.buildingName}</span>
        </div>
      ),
    },
    {
      header: isStaff ? "Khách gửi xe" : "Xe đã đăng ký",
      key: "customer",
      render: (row) => (
        <div className="reservation-person-cell">
          <strong>{row.userName || row.guestName || "Khách vãng lai"}</strong>
          <span>{row.guestPhone || row.userPhone || row.userEmail || ""}</span>
          <span>{row.plateNumber}</span>
        </div>
      ),
    },
    {
      header: "Ô đỗ",
      key: "slotCode",
      render: (row) => (
        <div className="reservation-slot-cell">
          <MapPin size={15} />
          <span>
            {row.floorName} - {row.slotCode}
          </span>
        </div>
      ),
    },
    {
      header: "Khung giờ",
      key: "startAt",
      minWidth: 210,
      render: (row) => (
        <div className="reservation-time-cell">
          <span>{formatDateTime(row.startAt)}</span>
          <strong>đến {formatDateTime(row.endAt)}</strong>
        </div>
      ),
    },
    {
      header: "Thanh toán",
      key: "paymentStatus",
      render: (row) => {
        const meta =
          paymentStatusMeta[row.paymentStatus] || paymentStatusMeta.PENDING;

        return (
          <div className="reservation-payment-cell">
            <strong>{formatCurrency(row.amount)}</strong>
            <span>{row.paymentMethod === "CASH" ? "Tiền mặt" : "VNPay"}</span>
            <span className={`pill ${meta.tone}`}>{meta.label}</span>
          </div>
        );
      },
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => {
        const meta =
          reservationStatusMeta[row.status] || reservationStatusMeta.CANCELLED;

        return <span className={`pill ${meta.tone}`}>{meta.label}</span>;
      },
    },
  ];

  return (
    <div className="parking-page hourly-reservation-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <CalendarClock size={16} /> Đặt ô theo giờ
          </div>
          <h1 className="page-title">
            {isStaff
              ? "Giữ ô ô tô trước cho khách vãng lai"
              : "Đặt trước ô ô tô trong tòa nhà của bạn"}
          </h1>
          <p className="page-subtitle">
            Chọn khung giờ, thanh toán trước và sử dụng đúng ô đã giữ. Xe ra
            trong thời gian đặt không phát sinh thêm phí gửi xe.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Lượt còn hiệu lực</span>
          <strong className="page-hero-number">{activeReservations}</strong>
          <span className="page-hero-label">Tại tòa nhà hiện tại</span>
        </div>
      </section>

      <StatusBanner
        success={[
          paymentReturn?.tone === "success" ? paymentReturn.message : null,
          notice,
        ]}
        warning={[
          paymentReturn?.tone === "warning" ? paymentReturn.message : null,
          paymentReturn?.smsWarning,
          hourlyReservations.lastCreated?.sms?.status === "FAILED"
            ? `Đã giữ ô nhưng chưa gửi được SMS: ${
                hourlyReservations.lastCreated.sms.error ||
                "Máy chủ chưa kết nối được dịch vụ SMS."
              }`
            : null,
          hourlyReservations.lastCreated?.sms?.status === "PREVIEW"
            ? "SMS mới chỉ được kiểm tra thử và chưa gửi đến điện thoại của khách."
            : null,
        ]}
        errors={[formError, hourlyReservations.error]}
      />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Clock3 size={19} /> Chọn thời gian và ô đỗ
            </h2>
            <p className="section-copy">
              Mức tiền được tính theo giá ô tô mỗi giờ của tòa nhà. Phần giờ
              chưa tròn được tính thành một giờ.
            </p>
          </div>
          <Button
            variant="outline"
            icon={Search}
            loading={hourlyReservations.availabilityLoading}
            onClick={handleCheckAvailability}
          >
            Kiểm tra ô trống
          </Button>
        </div>

        <div className="reservation-period-grid">
          <FormField label="Bắt đầu" required>
            <Input
              type="datetime-local"
              min={reservationBounds.minimumInput}
              max={reservationBounds.maximumInput}
              value={period.startAt}
              onChange={(event) =>
                handlePeriodChange("startAt", event.target.value)
              }
            />
          </FormField>
          <FormField label="Kết thúc" required>
            <Input
              type="datetime-local"
              min={period.startAt || reservationBounds.minimumInput}
              max={reservationBounds.maximumInput}
              value={period.endAt}
              onChange={(event) =>
                handlePeriodChange("endAt", event.target.value)
              }
            />
          </FormField>
          <div className="reservation-quote">
            <span>Đơn giá</span>
            <strong>
              {hourlyReservations.availability.quote
                ? `${formatCurrency(
                    hourlyReservations.availability.quote.hourlyRate
                  )} / giờ`
                : "Chưa tính"}
            </strong>
          </div>
          <div className="reservation-quote featured">
            <span>Tổng thanh toán</span>
            <strong>
              {hourlyReservations.availability.quote
                ? formatCurrency(
                    hourlyReservations.availability.quote.amount
                  )
                : "Chưa tính"}
            </strong>
            {hourlyReservations.availability.quote && (
              <small>
                {hourlyReservations.availability.quote.reservedHours} giờ
              </small>
            )}
          </div>
        </div>

        <div className="reservation-slot-heading">
          <div>
            <h3>Ô đỗ phù hợp</h3>
            <p>
              Ô có viền xanh có thể chọn. Ô đang chọn được làm nổi bật bằng
              màu hồng cam.
            </p>
          </div>
          <span>
            {availableSlots.filter((slot) => slot.isAvailable).length} ô có thể
            đặt
          </span>
        </div>

        {availableSlots.length > 0 ? (
          <div className="hourly-floor-groups">
            {slotsByFloor.map((floor) => {
              const availableCount = floor.slots.filter(
                (slot) => slot.isAvailable
              ).length;

              return (
                <section
                  className="hourly-floor-group"
                  key={floor.floorId || floor.floorName}
                >
                  <div className="hourly-floor-heading">
                    <div>
                      <Layers3 size={18} />
                      <strong>{floor.floorName}</strong>
                    </div>
                    <span>
                      {availableCount}/{floor.slots.length} ô có thể đặt
                    </span>
                  </div>
                  <div className="hourly-slot-grid">
                    {floor.slots.map((slot) => {
                      const isSelected =
                        String(slot.id) === String(selectedSlotId);

                      return (
                        <button
                          type="button"
                          key={slot.id}
                          className={`hourly-slot ${
                            slot.isAvailable ? "available" : "unavailable"
                          } ${isSelected ? "selected" : ""}`}
                          disabled={!slot.isAvailable}
                          onClick={() => {
                            dispatch(clearParkingNotice());
                            setFormError("");
                            setSelectedSlotId(String(slot.id));
                          }}
                          title={slot.unavailableReason || "Có thể đặt"}
                        >
                          <strong>{slot.slotCode}</strong>
                          <span>{floor.floorName}</span>
                          <small>
                            {isSelected
                              ? "Đang chọn"
                              : slot.isAvailable
                                ? "Còn trống"
                                : slot.unavailableReason}
                          </small>
                          {isSelected && <CheckCircle2 size={18} />}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="reservation-empty-slots">
            <Car size={28} />
            <span>
              Chọn khung giờ rồi bấm “Kiểm tra ô trống” để xem dữ liệu thật.
            </span>
          </div>
        )}
      </section>

      <form className="card section-card" onSubmit={handleSubmit}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {isStaff ? <UserRound size={19} /> : <Car size={19} />}
              {isStaff ? "Thông tin khách vãng lai" : "Ô tô dùng để đặt chỗ"}
            </h2>
            <p className="section-copy">
              {isStaff
                ? "Nhân viên ghi đúng thông tin khách và biển số trước khi thu tiền."
                : "Chỉ ô tô đã được duyệt và thuộc tòa nhà hiện tại mới được sử dụng."}
            </p>
          </div>
          {selectedSlot && (
            <div className="selected-slot-summary">
              <MapPin size={17} />
              <span>
                {selectedSlot.floorName} - <strong>{selectedSlot.slotCode}</strong>
              </span>
            </div>
          )}
        </div>

        {isStaff ? (
          <div className="reservation-form-grid">
            <FormField label="Tên khách gửi xe" required>
              <Input
                value={guestForm.guestName}
                placeholder="Nhập họ tên khách"
                onChange={(event) =>
                  setGuestForm((current) => ({
                    ...current,
                    guestName: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              label="Số điện thoại"
              required
              error={guestPhoneError}
            >
              <Input
                type="tel"
                value={guestForm.guestPhone}
                placeholder="Nhập số điện thoại"
                inputMode="numeric"
                maxLength={10}
                onChange={(event) => {
                  setGuestPhoneError("");
                  setGuestForm((current) => ({
                    ...current,
                    guestPhone: sanitizeVietnamPhoneInput(event.target.value),
                  }));
                }}
              />
            </FormField>
            <FormField label="Biển số ô tô" required>
              <div className="reservation-plate-input">
                <Input
                  value={guestForm.plateNumber}
                  placeholder="Ví dụ: 51H-123.45"
                  onChange={(event) =>
                    setGuestForm((current) => ({
                      ...current,
                      plateNumber: event.target.value.toUpperCase(),
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  icon={Camera}
                  onClick={() => setPlateScannerOpen(true)}
                >
                  Quét bằng camera
                </Button>
              </div>
            </FormField>
            <FormField label="Hình thức thanh toán" required>
              <Select
                value={guestForm.paymentMethod}
                placeholder=""
                options={[
                  { value: "CASH", label: "Tiền mặt" },
                  { value: "VNPAY", label: "VNPay" },
                ]}
                onChange={(event) =>
                  setGuestForm((current) => ({
                    ...current,
                    paymentMethod: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField label="Ghi chú" className="reservation-note-field">
              <textarea
                className="form-input reservation-note"
                value={guestForm.note}
                placeholder="Thông tin cần lưu ý khi khách đến"
                onChange={(event) =>
                  setGuestForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>
        ) : (
          <FormField label="Chọn ô tô đã được duyệt" required>
            <Select
              value={effectiveVehicleId}
              placeholder={
                approvedCars.length
                  ? "Chọn ô tô"
                  : "Bạn chưa có ô tô đã được duyệt"
              }
              options={approvedCars.map((vehicle) => ({
                value: vehicle.id,
                label: `${vehicle.plateNumber} - ${vehicle.brand || "Ô tô"} ${
                  vehicle.color || ""
                }`.trim(),
              }))}
              onChange={(event) => setVehicleId(event.target.value)}
            />
          </FormField>
        )}

        <div className="reservation-submit-row">
          <div className="reservation-payment-note">
            <CreditCard size={18} />
            <span>
              {isStaff && guestForm.paymentMethod === "CASH"
                ? "Xác nhận đã thu đủ tiền trước khi giữ ô."
                : "Bạn sẽ được chuyển đến VNPay để thanh toán trước."}
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            icon={isStaff ? WalletCards : ShieldCheck}
            loading={
              isStaff
                ? hourlyReservations.creatingGuest
                : hourlyReservations.creatingUser
            }
            disabled={
              !selectedSlotId ||
              (!isStaff && approvedCars.length === 0)
            }
          >
            {isStaff && guestForm.paymentMethod === "CASH"
              ? "Xác nhận thu tiền và giữ ô"
              : "Thanh toán và giữ ô"}
          </Button>
        </div>
      </form>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <CalendarClock size={19} />
              {isStaff
                ? "Danh sách đặt ô của tòa nhà"
                : "Các lượt đặt ô của bạn"}
            </h2>
            <p className="section-copy">
              Theo dõi thời gian, số tiền và trạng thái sử dụng của từng ô.
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCcw}
            loading={hourlyReservations.listLoading}
            onClick={refresh}
          >
            Làm mới
          </Button>
        </div>

        <div className="reservation-filter-grid">
          <FormField label="Tìm kiếm">
            <Input
              value={search}
              placeholder="Biển số, tên khách, mã đặt chỗ hoặc ô đỗ"
              onChange={(event) => setSearch(event.target.value)}
            />
          </FormField>
          <FormField label="Trạng thái">
            <Select
              value={statusFilter}
              placeholder=""
              options={[
                { value: "", label: "Tất cả trạng thái" },
                ...Object.entries(reservationStatusMeta).map(
                  ([value, meta]) => ({
                    value,
                    label: meta.label,
                  })
                ),
              ]}
              onChange={(event) => setStatusFilter(event.target.value)}
            />
          </FormField>
        </div>

        <Table
          columns={columns}
          data={filteredReservations}
          loading={hourlyReservations.listLoading}
          pageSize={10}
          emptyMessage="Chưa có lượt đặt ô theo giờ."
        />
      </section>

      {isStaff && (
        <PlateCameraScanner
          autoApply={false}
          open={plateScannerOpen}
          title="Quét biển số khách đặt ô"
          onClose={() => setPlateScannerOpen(false)}
          onScan={(plateNumber) => {
            setGuestForm((current) => ({
              ...current,
              plateNumber,
            }));
            setPlateScannerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default HourlySlotReservationsPage;
