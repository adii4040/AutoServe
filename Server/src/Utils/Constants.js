
const cookieOption = {
    httpOnly: true,
    secure: true
}

const ServiceCategoriesEnum = [
    "Mechanical Service",
    "Electrical Service",
    "Car Wash & Detailing",
    "Battery Service",
    "Tyre Service",
];

const BookingStateEnum = [
    "CREATED",
    "DISPATCHING",
    "VENDOR_ASSIGNED",
    "VENDOR_EN_ROUTE",
    "INSPECTION_IN_PROGRESS",
    "DIAGNOSIS_SUBMITTED",
    "WAITING_FOR_USER_APPROVAL",
    "SERVICE_IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];

const PaymentStatusEnum = ["UNPAID", "PAID"];
const PaymentModeEnum = [
    "UPI",
    "CASH",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "NET_BANKING",
    "WALLET",
];
export {
    cookieOption,
    ServiceCategoriesEnum,
    BookingStateEnum,
    PaymentStatusEnum,
    PaymentModeEnum
}