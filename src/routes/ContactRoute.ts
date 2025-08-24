import { Router } from "express";
import validate from "../middleware/validate";
import validationSchema from "../schemas/Contact.schema";

export const ContactRouter = (contactController:any)=>{
    const router = Router();

    router.post("/",validate(validationSchema),contactController.handleIdentifyRequest);

    return router;
}