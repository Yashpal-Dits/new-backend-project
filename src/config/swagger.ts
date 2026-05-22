import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API Documentation",
      version: "1.0.0",
      description: "User Registration and Email OTP Verification API",
    
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["first_name", "last_name", "email", "password"],
          properties: {
            first_name: {
              type: "string",
              example: "John",
            },
            last_name: {
              type: "string",
              example: "Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "yash@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "SecurePass123",
              description: "Min 8 characters, must contain uppercase and number",
            },
          },
        },
        VerifyOTPRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "yash@example.com",
            },
            otp: {
              type: "string",
              example: "123456",
              description: "6-digit OTP code",
            },
          },
        },
        ResendOTPRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "yash@example.com",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:45.123Z",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:45.123Z",
            },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Registration started. OTP sent to your email.",
            },
            data: {
              type: "object",
              properties: {
                userId: {
                  type: "number",
                  example: 1,
                },
                email: {
                  type: "string",
                  example: "yash@example.com",
                },
                status: {
                  type: "string",
                  example: "pending_verification",
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        VerifyOTPResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Email verified successfully. Your account is now active.",
            },
            data: {
              type: "object",
              properties: {
                userId: {
                  type: "number",
                  example: 1,
                },
                email: {
                  type: "string",
                  example: "yash@example.com",
                },
                isActive: {
                  type: "boolean",
                  example: true,
                },
                verified: {
                  type: "boolean",
                  example: true,
                },
                role: {
                  type: "string",
                  example: "customer",
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "yash@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "SecurePass123",
            },
          },
        },
        
        LoginResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login successful.",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  description: "JWT Bearer Token for authentication",
                },
                user: {
                  type: "object",
                  properties: {
                    id: {
                      type: "number",
                      example: 1,
                    },
                    first_name: {
                      type: "string",
                      example: "John",
                    },
                    last_name: {
                      type: "string",
                      example: "Doe",
                    },
                    email: {
                      type: "string",
                      example: "yash@example.com",
                    },
                    role: {
                      type: "string",
                      example: "customer",
                    },
                  },
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
  },
  apis: ["src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
