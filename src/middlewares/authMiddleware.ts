import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import type { IAuthenticatedRequest } from "../interfaces/authInterfaces";

export const authenticate = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
) :void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(
        `Unauthorized access attempt: ${req.originalUrl}`
      );
       res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No token provided",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      logger.error("JWT_SECRET is not configured");
     res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: "Internal server error",
          timestamp: new Date().toISOString(),
        });
        return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        role: string;
    };
    req.user={
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role as any,
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Token expired");
       res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Token has expired",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Invalid token");
       res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Invalid token",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error(`Authentication error: ${error}`);
    res.status(HttpStatusCode.UNAUTHORIZED).json({
      success: false,
      message: "Authentication failed",
      timestamp: new Date().toISOString(),
    });
  }
};