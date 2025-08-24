import { Request, Response } from "express";
import { ContactService } from "../services/ContactService";
import Logger from "../utils/logger";
import { errorCodes } from "../errors/errorCodes";


export class contactController{

    constructor(private readonly service: ContactService){};

    handleIdentifyRequest = async (req:Request,res:Response)=>{

    try{
        const {email,phoneNumber} = req.body;

        Logger.info(`data:email - ${email}, ph no - ${phoneNumber}`);

        const contactInfo = await this.service.identify(email, phoneNumber);

        return res.status(200).json({contact:contactInfo});

    } catch(e){
        Logger.error(`Controller: ${e}`);
        
        res.status(500).json({error:errorCodes.INTERNAL_SERVER_ERROR});
    }
}

}
