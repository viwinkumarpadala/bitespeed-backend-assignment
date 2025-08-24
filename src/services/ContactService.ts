import { ContactRepository } from "../repositories/ContactRepository";
import { Contact } from "../types/Contact";
import { ContactInfo } from  "../types/ContactInfo";


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
        else{
            let primaryContactsList:Contact[] = MatchingContacts.filter(x=>x.linkPrecedence=="primary");
            let secondarContactsList:Contact[] = MatchingContacts.filter(x=>x.linkPrecedence=="secondary");

            let emailexists = MatchingContacts.some(x=>x.email===email);
            let phoneNumberExists = MatchingContacts.some(x=>x.phoneNumber===phoneNumber);

            let primarycontact;
            let secondaryContacts;
            let updatedContacts;

            if(primaryContactsList.length==0){
                updatedContacts = await this.allSecondaryContactsHandler(MatchingContacts);
            }

            primarycontact = updatedContacts[0];
            secondaryContacts = updatedContacts.slice(1);

            const newSecondaryContact = await this.contactRepository.createSecondaryContact(primarycontact.id,emailexists,phoneNumberExists,email,phoneNumber);

            if(newSecondaryContact){
                updatedContacts.push(newSecondaryContact);
                secondaryContacts.push(newSecondaryContact);
            }

            return {
                primaryContactId:primarycontact.id,
                emails:Array.from(new Set(updatedContacts.map(x=>x.email).filter(Boolean))),
                phoneNumbers:Array.from(new Set(updatedContacts.map(x => x.phoneNumber).filter(Boolean))),
                secondaryContactIds:secondaryContacts.map(x=>x.id)
            };
        }
    }

    

    private async allSecondaryContactsHandler(SecondaryContacts:Contact[]){
        const linkedPrimaryIDs = SecondaryContacts.slice(1).map(x=>x.linkedId);

        if(SecondaryContacts.length==1){
            
            let primaryContactId = SecondaryContacts[0].linkedId;

            const contacts = await this.contactRepository.getContactsById(primaryContactId);
            
            return contacts;
        }
        else{
            
            const LinkedPrimaryContacts = await this.contactRepository.getLinkedPrimaryContacts(linkedPrimaryIDs);

            const updatedContacts = this.contactRepository.primaryToSecondaryHandler(LinkedPrimaryContacts);

            return updatedContacts;
        }

    }

    
}