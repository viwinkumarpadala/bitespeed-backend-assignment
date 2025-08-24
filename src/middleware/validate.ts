import { NextFunction,Request,Response } from "express";
import {ZodObject,ZodError} from "zod";
import Logger from "../utils/logger";
import { errorCodes } from "../errors/errorCodes";

const validate = (schema:ZodObject<any>) =>(req:Request,res:Response,next:NextFunction) =>{
    try{
        schema.parse(req.body);
        next();
    }
    catch(e:any){
        Logger.error(`Middleware check errors:`);
        if(e instanceof ZodError){
            const errorMessage = e.issues[0]?.message || errorCodes.VALIDATION_ERROR;
            return res.status(400).json({ error: errorMessage });
        }
        return res.status(500).json({error:errorCodes.INTERNAL_SERVER_ERROR});
    }
}

export default validate;