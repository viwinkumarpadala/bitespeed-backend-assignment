import {prisma} from "../config/db";
import { Contact } from "../types/contact";

export class ContactRepository{

    async createPrimaryContact(email?:string,phoneNumber?:string): Promise<Contact>{
    const newPrimaryContact = await prisma.contact.create({
        data:{
            email,
            phoneNumber,
            linkPrecedence:"primary"
        },
    });

    return newPrimaryContact;
    }


   async getMatchingContacts(email?:string,phoneNumber?:string): Promise<Contact[]>{
        const contacts = await prisma.contact.findMany({
            where:{
                OR:[{email:email??undefined},{phoneNumber:phoneNumber??undefined}],
                deletedAt:null
            },
            orderBy:{createdAt:"asc"}
        });
        return contacts;
    }

    
}