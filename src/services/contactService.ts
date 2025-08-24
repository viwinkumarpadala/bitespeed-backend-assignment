import { ContactRepository } from "../repositories/ContactRepository";
import { Contact } from "../types/contact";
import { ContactInfo } from  "../types/contactInfo";


export class ContactService{

    constructor(
        private readonly contactRepository: ContactRepository
    ){};

    async identify(email?:string,phoneNumber?:string):Promise<ContactInfo>{

        let MatchingContacts:Contact[] = await this.contactRepository.getMatchingContacts(email,phoneNumber);

        if(MatchingContacts.length==0){
            const newPrimaryContact = await this.contactRepository.createPrimaryContact(email,phoneNumber);

            return {
                primaryContactId:newPrimaryContact.id,
                emails:[newPrimaryContact.email],
                phoneNumbers:[newPrimaryContact.phoneNumber],
                secondaryContactIds:null
            }
        }
    }

    
}