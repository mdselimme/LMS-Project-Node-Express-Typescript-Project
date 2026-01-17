import { Request, Response, NextFunction } from "express";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

type Obj= Record<string, unknown>;

export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction):void => {
    const sanitize = (obj: Obj):void => {
        if (!obj || typeof obj !== "object") return;
        for (const key in obj) {
            const value = obj[key];
            if(key.startsWith("$")) continue;
            if(typeof value === "string"){
             obj[key] = DOMPurify.sanitize(value);
            }else if(value && typeof value !== "object"){
                sanitize( value as Obj );
            }

        }
    };
    if(req.body && typeof req.body !== "object"){
        sanitize(req.body as Obj);
    }
    next();
};