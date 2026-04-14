# AutoServe Backend Workflow

This document describes the implemented business logic and end-to-end workflow for AutoServe.

## 1. System Overview

AutoServe is a user-vendor marketplace backend with:
- User onboarding and authentication
- Vendor onboarding with online + physical verification
- Booking lifecycle management with dispatch and state machine
- Real-time tracking via Socket.IO
- Two-step payments using Razorpay

Base API prefixes from `src/app.js`:
- `/api/v1/user`
- `/api/v1/vendor`
- `/api/v1/bookings`
- `/api/v1/payment`

## 2. Actors and Responsibilities

- User:
  - Registers and logs in
  - Creates bookings
  - Tracks vendor live location
  - Approves diagnosis/services
  - Pays inspection fee and service fee

- Vendor:
  - Registers with KYC docs
  - Gets physically verified and activates account
  - Accepts/executes jobs
  - Shares live location
  - Submits diagnosis and completes service

- System:
  - Dispatches booking requests to nearby vendors
  - Ranks and batches vendors
  - Emits socket updates
  - Processes and verifies payment events

## 3. Authentication Model

User auth middleware: `src/Middlewares/auth.middleware.js`
- Accepts `accessToken` cookie or `Authorization: Bearer <token>`
- Loads user into `req.user`

Vendor auth middleware: `src/Middlewares/authVendor.middleware.js`
- Accepts `vendorAccessToken` cookie or bearer token
- Requires decoded token role `VENDOR`
- Loads vendor into `req.vendor`

## 4. Booking State Machine

Declared in `src/Utils/Constants.js` and used in service logic.

Primary runtime flow in `src/Services/booking.service.js`:
1. `CREATED`
2. `DISPATCHING`
3. `VENDOR_ASSIGNED`
4. `VENDOR_EN_ROUTE`
5. `INSPECTION_IN_PROGRESS`
6. `WAITING_FOR_USER_APPROVAL`
7. `SERVICE_IN_PROGRESS`
8. `COMPLETED` or `CANCELLED`

Every transition is tracked in `stateHistory`.

## 5. User Workflow

1. Register/login
- `POST /api/v1/user/register`
- `POST /api/v1/user/login`

2. Create booking
- `POST /api/v1/bookings`
- Validates service category, vehicle info, coordinates, and address.
- Blocks user if another active booking exists.

3. Track booking
- `GET /api/v1/bookings/my-bookings`
- `GET /api/v1/bookings/:id`
- `GET /api/v1/bookings/:id/live-tracking` (fallback endpoint)
- Socket namespace `/tracking` for real-time updates.

4. Approve diagnosis
- `POST /api/v1/bookings/:id/approve-services`
- Converts selected diagnosis services into final executable services.

5. Payment
- Inspection fee order: `POST /api/v1/payment/create-order` with `paymentType=inspection`
- Verify inspection payment: `POST /api/v1/payment/verify`
- Service fee order: `POST /api/v1/payment/create-order` with `paymentType=service`
- Verify service payment: `POST /api/v1/payment/verify`

## 6. Vendor Workflow

1. Register + verification
- `POST /api/v1/vendor/register` (PAN + Aadhar upload)
- OCR based online verification
- Physical verification by admin/employee:
  - `POST /api/v1/vendor/:vendorId/physical-verification`

2. Activate/login
- `POST /api/v1/vendor/activate-account`
- `POST /api/v1/vendor/login`

3. Booking execution
- `PATCH /api/v1/bookings/:id/accept`
- `PATCH /api/v1/bookings/:id/en-route`
- `PATCH /api/v1/bookings/:id/live-location`
- `PATCH /api/v1/bookings/:id/arrived`
- `POST /api/v1/bookings/:id/diagnosis`
- `POST /api/v1/bookings/:id/complete`

## 7. Dispatch Logic

Implemented in `dispatchBooking()`:
- Starts after booking creation
- Finds vendors by geospatial radius
- Expands search radius in steps until max radius
- Filters only verified, available, category-compatible vendors
- Ranks candidates using acceptance and rating behavior
- Creates vendor batches and stores in `dispatchMeta`
- Notifies vendors with `NEW_BOOKING`

## 8. Real-Time Tracking

Namespace: `/tracking` in `src/Socket/tracking.socket.js`

Events:
- Client join room: `tracking:join` with `bookingId`
- Server push location: `location:update`
- Server push arrival: `vendor:arrived`

Room format: `booking:<bookingId>`

## 9. Payment Workflow (Two Separate Payments)

Controller: `src/Controllers/payment.controller.js`

Payment types:
- `inspection`
- `service`

Amount computation:
- inspection -> `booking.inspection.inspectionFeeFinal`
- service -> sum of `booking.serviceExecution.finalServices[].finalPrice`

Order creation:
- Saves active order in `booking.payment`
- Stores `paymentType` in Razorpay order `notes`
- Prevents duplicate payment per fee type

Verification:
- Verifies Razorpay signature
- Updates `booking.payment`
- Updates either `booking.payments.inspection` or `booking.payments.service`

Webhook:
- Route: `POST /api/v1/payment/webhook`
- Validates webhook signature using `RAZORPAY_WEBHOOK_SECRET`
- On `payment.captured`, fetches order and reads `notes.paymentType`
- Updates correct payment subdocument
- Returns 200 even when booking mapping is missing

## 10. Notifications

Notification service in `src/Services/notification.service.js` is currently stubbed.
Current events include:
- `NEW_BOOKING` to vendors
- `BOOKING_ACCEPTED`, `VENDOR_ARRIVED`, `DIAGNOSIS_READY` to users
- `PAYMENT_RECEIVED` to vendors
- `INSPECTION_PAYMENT_RECEIVED` to users for inspection fee payments

## 11. Validation and Error Handling

- Schema validation via zod in `src/Middlewares/validate.middleware.js`
- Input sanitization with `validator.escape`
- Global error handler in `src/app.js`
- Centralized logs via morgan + custom logger

## 12. Operational Notes

- Booking create endpoint is `POST /api/v1/bookings` (not `/create`).
- Nearby vendor endpoint is `GET /api/v1/bookings/nearby-vendors`.
- Port conflict (`EADDRINUSE`) means another process is already using configured `PORT`.
- Payment webhook requires raw request body integrity and matching webhook secret.
