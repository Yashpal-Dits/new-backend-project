import { UserRole, RegistrationStatus } from "../enums";

// Standard API Response for Success

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  timestamp: string;
}

// Standard API Response for Error

export interface ApiErrorResponse {
  success: false;
  message: string;
  timestamp: string;
}

// Combined API Response Type

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;


//   Register User Request

export interface IRegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

//  Verify OTP Request

export interface IVerifyOTPRequest {
  email: string;
  otp: string;
}


export interface IResendOTPRequest {
  email: string;
}

// REGISTRATION RESPONSE DATA 


export interface INewRegistrationResponse {
  userId: number;
  email: string;
  status: RegistrationStatus.PENDING_VERIFICATION;
}

//  Response when existing unverified user registers again

export interface IExistingUserRegistrationData {
  email: string;
  status: RegistrationStatus.PARTIAL_REGISTRATION;
}

// Union type for all registration responses

export type IRegisterResponseData =
  | INewRegistrationResponse
  | IExistingUserRegistrationData;

// Verify OTP Response Data
export interface IVerifyOTPResponseData {
  userId: number;
  email: string;
  isActive: boolean;
  verified: boolean;
}

//Generic Auth Service Response

export interface IAuthServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

// OTP Service Response

export interface IOTPServiceResponse {
  success: boolean;
  message: string;
  timestamp: string;
}


// User Entity Interface

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// User Status from Database

export interface IUserStatus {
  exists: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
}

// Create User Response from Repository
export interface ICreateUserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

// OTP Entity Interface

export interface IOTP {
  id: number;
  email: string;
  otp: string;
  expires_at: Date;
  is_used: boolean;
  purpose: string;
  created_at: Date;
  user_id?: number;
}

// Authenticated Request with User

export interface IAuthenticatedRequest extends Express.Request {
  user?: IUser;
  userId?: number;
}