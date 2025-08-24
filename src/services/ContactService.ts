import { ContactRepository } from "../repositories/ContactRepository";
import { Contact } from "../types/Contact";
import { ContactInfo } from  "../types/ContactInfo";
import Logger from "../utils/Logger";


export class ContactService{

    constructor(
        private readonly contactRepository: ContactRepository
    ){};

    async identify(email?:string,phoneNumber?:string):Promise<ContactInfo>{

        // Get all the matching contacts
        let MatchingContacts:Contact[] = await this.contactRepository.getMatchingContacts(email,phoneNumber);
        
        if(MatchingContacts.length==0){
            // If there are no matching contacts create a primary contact
            const newPrimaryContact = await this.contactRepository.createPrimaryContact(email,phoneNumber);

            // return the updated data in the below format
            return {
                primaryContactId:newPrimaryContact.id,
                emails:[newPrimaryContact.email],
                phoneNumbers:[newPrimaryContact.phoneNumber],
                secondaryContactIds:null
            }
        }
        else{
            // Get all the primary and secondary contact lists from MatchingContacts
            let primaryContactsList:Contact[] = MatchingContacts.filter(x=>x.linkPrecedence=="primary");
            let secondaryContactsList:Contact[] = MatchingContacts.filter(x=>x.linkPrecedence=="secondary");

            // Check if email and phonenumber already exists
            let emailexists = MatchingContacts.some(x=>x.email===email);
            let phoneNumberExists = MatchingContacts.some(x=>x.phoneNumber===phoneNumber);

            let primarycontact;
            let secondaryContacts;
            let updatedContacts;

            if(primaryContactsList.length==0){
                // If there are only secondary contacts in the matched contacts data:
                // 1. If there is only one linked primary ID in all the secondary contacts then return the linked data
                // 2. If there are multiple linked primary IDs, then link them to the oldest primary ID and return the updated data
                updatedContacts = await this.allSecondaryContactsHandler(MatchingContacts);
            }
            else if(secondaryContactsList.length==0){
                // If there are only primary contacts in the matched contacts data:
                if(primaryContactsList.length==1){
                    // 1. If there is only one primary ID then return the linked data
                    updatedContacts = await this.contactRepository.getContactsById(MatchingContacts[0].id);
                }
                else{
                    // 2. If there are multiple matched Primary IDs, then link them to the oldest primary ID and return the updated data
                    updatedContacts = await this.contactRepository.primaryToSecondaryHandler(MatchingContacts);
                }
            }
            else if(primaryContactsList.length!=0 && secondaryContactsList.length!=0){
                // If there are multiple primary and secondary contacts in the matched contacts data:
                // 1. If all of them are linked to a single primary ID then return the linked data
                // 2. If there are multiple primary IDs and linked primary IDs, then link them to the oldest primary ID and return the updated data
                updatedContacts = await this.multiplePrimaryAndSecondaryHandler(primaryContactsList,secondaryContactsList);
            }

            primarycontact = updatedContacts[0];
            secondaryContacts = updatedContacts.slice(1);

            // Create a secondary contact if both email and phonenumber doesn't exist in database
            const newSecondaryContact = await this.contactRepository.createSecondaryContact(primarycontact.id,emailexists,phoneNumberExists,email,phoneNumber);
            
            // Update the contacts list
            if(newSecondaryContact){
                updatedContacts.push(newSecondaryContact);
                secondaryContacts.push(newSecondaryContact);
            }

            // return the updated data in the below format
            return {
                primaryContactId:primarycontact.id,
                emails:Array.from(new Set(updatedContacts.map(x=>x.email).filter(Boolean))),
                phoneNumbers:Array.from(new Set(updatedContacts.map(x => x.phoneNumber).filter(Boolean))),
                secondaryContactIds:secondaryContacts.map(x=>x.id)
            };
        }
    }

    

    // If there are only secondary contacts in the matched contacts data
    private async allSecondaryContactsHandler(SecondaryContacts:Contact[]){

        const linkedPrimaryIDs = SecondaryContacts.slice(1).map(x=>x.linkedId);

        if(SecondaryContacts.length==1){

            // If there is only one linked primary ID, we can just return the linked contacts data

            let primaryContactId = SecondaryContacts[0].linkedId;

            const contacts = await this.contactRepository.getContactsById(primaryContactId);
            
            return contacts;
        }
        else{

            // If there are multiple linked primary IDs then handle the linking and return the updated data which is linked
            // only to the oldest matched contact
            
            const LinkedPrimaryContacts = await this.contactRepository.getLinkedPrimaryContacts(linkedPrimaryIDs);

            const updatedContacts = this.contactRepository.primaryToSecondaryHandler(LinkedPrimaryContacts);

            return updatedContacts;
        }

    }

    // If there are multiple primary and secondary contacts in the matched contacts data
    private async multiplePrimaryAndSecondaryHandler(primaryContactsList:Contact[],secondaryContactsList:Contact[]){

        const allPrimaryIds = [...new Set([...primaryContactsList.map(x=>x.id),...secondaryContactsList.map(x=>x.linkedId)])];


        if(allPrimaryIds.length==1){
            // If there is only one linked primary ID for all the contacts then return the linked contacts data
            const contacts = this.contactRepository.getContactsById(allPrimaryIds[0]);
            Logger.info(`Contacts:${JSON.stringify(contacts)}`); 
            return contacts;
        }
        else{
            // If there are multiple linked primary contact IDs, then convert all the other contacts and their linked contacts to secondary, 
            // with only the oldest contact as primary
            const LinkedPrimaryContacts = await this.contactRepository.getLinkedPrimaryContacts(allPrimaryIds);

            const updatedContacts = await this.contactRepository.primaryToSecondaryHandler(LinkedPrimaryContacts);

            Logger.info(`updated contacts:${JSON.stringify(updatedContacts)}`);

            return updatedContacts;
        }
    }

    
}