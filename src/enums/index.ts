// User roles

export enum UserRole {
    CUSTOMER = "customer",
    SELLER = "seller",
    ADMIN = "admin",
}

//   OTP Purpose
export enum OTPPurpose {
    REGISTRATION = "registration",
    PASSWORD_RESET = "password_reset",
    EMAIL_VERIFICATION = "email_verification",
}

//   Registration Status
export enum RegistrationStatus {
    PENDING_VERIFICATION = "pending_verification",
    PARTIAL_REGISTRATION = "partial_registration",
}

//     HTTP Status Codes
export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500,
}

//     Email Status
export enum EmailStatus {
    VERIFIED = "verified",
    UNVERIFIED = "unverified",
}
