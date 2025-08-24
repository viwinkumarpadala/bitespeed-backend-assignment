import {prisma} from "../config/db";
import { Contact } from "../types/Contact";

export class ContactRepository{
    
    // Create a primary contact
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
    
    // Create a secondary contact
    async createSecondaryContact(
        primaryIdNumber:number,
        emailExists:boolean,
        phoneNumberExists:boolean,
        email?:string,
        phoneNumber?:string
    ): Promise<Contact>
    {

        if((!emailExists || !phoneNumberExists) && (email && phoneNumber)){ 
            const newSecondaryContact = await prisma.contact.create({
            data:{
                email,
                phoneNumber,
                linkPrecedence:"secondary",
                linkedId: primaryIdNumber
            }
        });
           return newSecondaryContact;
        }
    }

   // Get all matching contacts using the provided email and phonenumber
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

    // Get all the primary and secondary contacts that are linked with an ID
    async getContactsById(primaryIdNumber:number): Promise<Contact[]>{
    const PrimaryContacts = await prisma.contact.findMany({
        where:{
            OR:[{id:primaryIdNumber},{linkedId:primaryIdNumber}],
            deletedAt:null
        },
        orderBy:{createdAt:"asc"}
    });

    return PrimaryContacts;
   }

   // Get all contacts that match the given list of IDs
   async getLinkedPrimaryContacts(primaryIds:number[]): Promise<Contact[]>{
    const LinkedPrimaryContacts = await prisma.contact.findMany({
        where:{
            id:{in:primaryIds},
            deletedAt:null
        },
        orderBy:{createdAt:"asc"}
    });

    return LinkedPrimaryContacts;
   }

   // Convert the linked primary contacts into secondary contacts
   async primaryToSecondaryHandler (MatchingContacts:Contact[]){

        let primaryContact:Contact = MatchingContacts[0];
        const IDs = MatchingContacts.slice(1).map(x=>x.id);

        await prisma.contact.updateMany({
            where:{linkedId:{in:IDs}},
            data:{
                linkedId:primaryContact.id
            }
        });

        await prisma.contact.updateMany({
            where:{id:{in:IDs}},
            data:{
                linkedId:primaryContact.id,
                linkPrecedence:"secondary"
            }
        });

        const updatedContacts = await this.getContactsById(primaryContact.id);

        return updatedContacts;

    }

    
}