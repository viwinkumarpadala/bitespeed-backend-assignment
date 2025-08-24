import {z} from "zod";
import { errorCodes } from "../errors/errorCodes";

const validationSchema = z.object({
    email:z.email({message:errorCodes.INVALID_EMAIL}).nullable().optional(),
    phoneNumber: z.string().regex(/^\d*$/, {message: errorCodes.INVALID_PHONE_NUMBER,}).optional().nullable(),

}).refine(data=>data.email||data.phoneNumber,{
    message: errorCodes.MISSING_CREDENTIALS
})

export default validationSchema;