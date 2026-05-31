import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce Backend API Documentation",
      version: "1.0.0",
      description: "User Registration, Categories & Products APIs",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT Authorization header using the Bearer scheme. Example: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...",
        },
      },
      schemas: {
        //      AUTH SCHEMAS
        RegisterRequest: {
          type: "object",
          required: ["first_name", "last_name", "email", "password"],
          properties: {
            first_name: { type: "string", example: "John" },
            last_name: { type: "string", example: "Doe" },
            email: { type: "string", format: "email", example: "yash@example.com" },
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
            email: { type: "string", format: "email", example: "yash@example.com" },
            otp: { type: "string", example: "123456", description: "6-digit OTP code" },
          },
        },
        ResendOTPRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "yash@example.com" },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "yash@gmail.com",
              description: "User's registered email address",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["email", "otp", "newPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "yash@gmail.com",
              description: "User's registered email address",
            },
            otp: {
              type: "string",
              minLength: 6,
              maxLength: 6,
              pattern: "^[0-9]{6}$",
              example: "123456",
              description: "OTP code sent to email for password reset",
            },
            newPassword: {
              type: "string",
              format: "password",
              minLength: 8,
              example: "NewPassword456",
              description: "New password must be at least 8 characters and contain uppercase letter and number",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword", "confirmPassword"],
          properties: {
            currentPassword: { type: "string", format: "password", example: "OldPassword123", description: "User's current password" },
            newPassword: {
              type: "string",
              format: "password",
              minLength: 8,
              example: "NewPassword456",
              description: "New password must be at least 8 characters and contain uppercase letter and number",
            },
            confirmPassword: { type: "string", format: "password", example: "NewPassword456", description: "Must match newPassword" },
          },
        },
        LogoutRequest: {
          type: "object",
          description: "Logout request (body is empty, token is sent in Authorization header)",
          properties: {},
          example: {},
        },

        //                          CATEGORY SCHEMAS
        CreateCategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Electronics" },
            description: { type: "string", nullable: true, example: "All electronic items and gadgets" },
          },
        },
        UpdateCategoryRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "Updated Electronics" },
            description: { type: "string", nullable: true, example: "Updated description for electronics" },
          },
        },
        CategoryResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Category created successfully" },
            data: { $ref: "#/components/schemas/Category" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        CategoriesListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Categories fetched successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        CategoryExistsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Category exists check completed" },
            data: { type: "boolean", example: true },
            timestamp: { type: "string", format: "date-time" },
          },
        },

        //               PRODUCT SCHEMAS       
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            store_id: { type: "integer", example: 1 },
            name: { type: "string", example: "Wireless Headphones" },
            price: { type: "number", example: 2999.99 },
            categories_id: { type: "integer", example: 2 },
            stock: { type: "integer", example: 50 },
            description: { type: "string", nullable: true, example: "High quality wireless headphones with noise cancellation" },
            image: { type: "string", nullable: true, example: "/uploads/products/product-123456789.jpg" },
            sku: { type: "string", nullable: true, example: "WH-001" },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 2 },
            name: { type: "string", example: "Electronics" },
            description: { type: "string", nullable: true, example: "All electronic items" },
          },
        },
        Store: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            store_name: { type: "string", example: "Tech Store" },
            description: { type: "string", nullable: true, example: "Official electronics store" },
            business_email: { type: "string", nullable: true, example: "store@example.com" },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        CreateStoreRequest: {
          type: "object",
          required: ["user_id", "store_name"],
          properties: {
            user_id: { type: "integer", example: 1 },
            store_name: { type: "string", example: "Tech Store" },
            description: { type: "string", nullable: true, example: "Official electronics store" },
            business_email: { type: "string", nullable: true, example: "store@example.com" },
            is_active: { type: "boolean", example: true, default: true },
          },
        },
        UpdateStoreRequest: {
          type: "object",
          properties: {
            user_id: { type: "integer", example: 1 },
            store_name: { type: "string", example: "Tech Store" },
            description: { type: "string", nullable: true, example: "Official electronics store" },
            business_email: { type: "string", nullable: true, example: "store@example.com" },
            is_active: { type: "boolean", example: true },
          },
        },
        StoreResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Store created successfully" },
            data: { $ref: "#/components/schemas/Store" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        StoresListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Stores fetched successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Store" },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        CreateProductRequest: {
          type: "object",
          required: ["store_id", "name", "price", "categories_id"],
          properties: {
            store_id: { type: "integer", example: 1 },
            name: { type: "string", example: "Wireless Headphones" },
            price: { type: "number", example: 2999.99 },
            categories_id: { type: "integer", example: 2 },
            stock: { type: "integer", example: 50, default: 0 },
            description: { type: "string", nullable: true, example: "High quality wireless headphones" },
            sku: { type: "string", nullable: true, example: "WH-001" },
            image: { type: "string", format: "binary", description: "Product image file (JPEG, PNG, WebP, GIF up to 5MB)" },
            is_active: { type: "boolean", example: true, default: true },
          },
        },
        UpdateProductRequest: {
          type: "object",
          properties: {
            store_id: { type: "integer", example: 1 },
            name: { type: "string", example: "Updated Headphones" },
            price: { type: "number", example: 2499.99 },
            categories_id: { type: "integer", example: 2 },
            stock: { type: "integer", example: 45 },
            description: { type: "string", nullable: true, example: "Updated description" },
            sku: { type: "string", nullable: true, example: "WH-001" },
            image: { type: "string", format: "binary", description: "Product image file (JPEG, PNG, WebP, GIF up to 5MB)" },
            is_active: { type: "boolean", example: true },
          },
        },
        ProductResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Product created successfully" },
            data: { $ref: "#/components/schemas/Product" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ProductsListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Products fetched successfully" },
            data: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
                pagination: {
                  type: "object",
                  properties: {
                    total: { type: "integer", example: 25 },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 10 },
                    totalPages: { type: "integer", example: 3 },
                  },
                },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },

        //                     COMMON RESPONSES
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            timestamp: { type: "string", format: "date-time", example: "2024-01-15T10:30:45.123Z" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
            timestamp: { type: "string", format: "date-time", example: "2024-01-15T10:30:45.123Z" },
          },
        },

        //                    AUTH RESPONSE SCHEMAS 
        RegisterResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Registration started. OTP sent to your email." },
            data: {
              type: "object",
              properties: {
                userId: { type: "number", example: 1 },
                email: { type: "string", example: "yash@example.com" },
                status: { type: "string", example: "pending_verification" },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        VerifyOTPResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Email verified successfully. Your account is now active." },
            data: {
              type: "object",
              properties: {
                userId: { type: "number", example: 1 },
                email: { type: "string", example: "yash@example.com" },
                isActive: { type: "boolean", example: true },
                verified: { type: "boolean", example: true },
                role: { type: "string", example: "customer" },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "yash@example.com" },
            password: { type: "string", format: "password", example: "SecurePass123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful." },
            data: {
              type: "object",
              properties: {
                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description: "JWT Bearer Token for authentication" },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "number", example: 1 },
                    first_name: { type: "string", example: "John" },
                    last_name: { type: "string", example: "Doe" },
                    email: { type: "string", example: "yash@example.com" },
                    role: { type: "string", example: "customer" },
                  },
                },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ForgotPasswordResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: " OTP has been sent to your registered email. valid for 10 minutes." },
            data: {
              type: "object",
              properties: {
                email: { type: "string", example: "yash@gmail.com" },
                message: { type: "string", example: "An OTP has been sent to your email. Use it to reset your password." },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ResetPasswordResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Your password has been reset successfully." },
            data: {
              type: "object",
              properties: {
                email: { type: "string", example: "john@example.com" },
                message: { type: "string", example: "Your password has been reset successfully." },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ChangePasswordResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Your password has been reset successfully." },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        LogoutResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "You have been logged out successfully." },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: { type: "string" },
              example: ["Email is required", "Password must contain uppercase letter"],
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        UnauthorizedErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "No token provided" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);