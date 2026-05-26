export const MESSAGES = {
    AUTH: {
        REGISTRATION_STARTED: "Registration started. OTP sent to your email.",
        REGISTRATION_PARTIAL: "OTP resent to your email. Complete  your registration.",
        EMAIL_ALREADY_REGISTERED: "Email is already registered and verified",
        REGISTRATION_FAILED: "Registration failed",

        OTP_SENT: (email: string) => `OTP sent to ${email}. Valid for 5 minutes.`,
        OTP_RESENT: (email: string) => `OTP resent to ${email}. Valid for 5 minutes.`,
        OTP_VERIFIED: "Email verified successfully. Your account is now active.",
        OTP_INVALID: "Invalid OTP code",
        OTP_EXPIRED: "OTP has expired",
        OTP_SEND_FAILED: "Failed to send OTP email",
        OTP_VERIFICATION_FAILED: "OTP verification failed",

         
        USER_NOT_FOUND: "User not found",
        USER_ALREADY_ACTIVE: "User already verified and active",
        EMAIL_VERIFIED_ALREADY: "Email is already verified",

        INVALID_EMAIL: "Invalid email format",
        INVALID_PASSWORD: "Password must be at least 8 charecters and contain uppercase letters and numbers",
        
        VALIDATION_FAILED: "Validatin failed",
        INTERNAL_ERROR: "Internal server error",
        RESEND_OTP_FAILED: "Failed to resend OTP",
        INVALID_CREDENTIALS : "The email or password you entered is incorrect.",
        ACCOUNT_NOT_ACTIVATED: "Your account is not yet verified. Please check your email for the verification code.",
        LOGIN_SUCCESS: "Successfully logged in..",
        LOGOUT_SUCCESS:"You  have been logged out successfully",
        LOGOUT_FAILED: "Logout failed",
        FORGOT_PASSWORD_OTP_SENT :"OTP has been  sent to  your registered email. Valid for 5 minutes.",
        PASSWORD_RESET_SUCCESS: "Your password has been reset successfully.",
        PASSWORD_SUCCESS_FAILED: "Password reset failed. Please try again.",
        OLD_PASSWORD_INCORRECT: "Old password is incorrect.",
        PASSWORD_RESET_FAILED: " Password reset failed."
    },

    VALIDATION: {
        FIRST_NAME_REQUIRED: "First name is required",
        LAST_NAME_REQUIRED: "Last name is required",
        EMAIL_REQUIRED: "Email is required",
        EMAIL_INVALID: "Invalid email format",
        PASSWORD_REQUIRED: "Password is required",
        PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
        PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
        PASSWORD_NUMBER: "Password must contain at least one number",
        PASSWORDS_NOT_MATCH: "Passwords not matched",
        OTP_REQUIRED: "OTP is required",
        OTP_LENGTH: "OTP must be 6 digits",
        NEW_PASSWORD_REQUIRED: "New password required.",
        
    },

    SUCCESS: {
        OPERATION_SUCCESSFUL: "Operation completed successfully",
        DATA_SAVED: "Data saved successfully",
        DATA_UPDATED: "Data updated successfully",
        DATA_DELETED: "Data deleted successfully",
    },



}