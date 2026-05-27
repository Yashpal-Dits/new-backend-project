import {Request, Response, NextFunction} from "express";
import logger from '../config/logger';

// HTTP request logging middleware
export const requestLogger  = (
    req: Request,
    res:Response,
    next: NextFunction
) => {
    const start = Date.now();
    res.on("finish", ()=> {
        const duration = Date.now() - start;

        logger.http({
            message: `${req.method} ${req.originalUrl}`,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
            responseSize : res.get("Content-Length"),
        });
    });
    next();
};


export const logAuthEvent = (
    action : string,
    userId?: number,
    email?: string,
    success?: boolean
) => {
    logger.info({
        message: `Auth Event : ${action}`,
        userId,
        email,
        success,
        
    });
};



export const logError = (
    error: Error,
    context : {
        userId? : number,
        endpoint?: string,
        method?:string,
        body? : any;
    } = {}
) => {
    logger.error({
        Message: error.message,
        stack: error.stack,
        ...context,
        timeStamp:new Date().toISOString(),
    });
};