import { ContactRepository } from "../repositories/ContactRepository";
import { ContactService } from "../services/ContactService";
import { Contact } from "../types/Contact";
import { ContactInfo } from "../types/ContactInfo";
import Logger from "../utils/Logger";

jest.mock("../config/db",()=>({
    prisma:{
        contact:{
            findMany:jest.fn(),
            findFirst:jest.fn(),
            create:jest.fn(),
            updateMany:jest.fn()
        }
    }
}))

function validateResponse(res:ContactInfo,expected:ContactInfo){

    Logger.info(`res:${JSON.stringify(res)}`);

    expect(res.primaryContactId).toBe(expected.primaryContactId);

    expect(res.emails).toEqual(expect.arrayContaining(expected.emails));

    expect(res.phoneNumbers).toEqual(expect.arrayContaining(expected.phoneNumbers));

    expect(res.secondaryContactIds).toEqual(expect.arrayContaining(expected.secondaryContactIds));

}

describe("Contact service unit test:",()=>{
    let service: ContactService;
    let mockRepository: jest.Mocked<ContactRepository>

    beforeEach(()=>{
        jest.clearAllMocks();

        mockRepository={
          createPrimaryContact:jest.fn(),
          createSecondaryContact:jest.fn(),
          getContactsById:jest.fn(),
          getLinkedPrimaryContacts:jest.fn(),
          getMatchingContacts:jest.fn(),
          primaryToSecondaryHandler:jest.fn()
        }

        service = new ContactService(mockRepository);
    })

    it("Create primary contact when no such contact exist", async ()=>{

        const Contact1:Contact = {
          "id":1,
          "email": "mcfly@hillvalley.edu",
          "phoneNumber": "123456",
          "linkPrecedence":"primary",
          "createdAt": new Date(),
          "updatedAt": new Date()
        }

        const expected:ContactInfo = {
          "primaryContactId":1,
		      "emails": ["mcfly@hillvalley.edu"],
		      "phoneNumbers": ["123456"],
		      "secondaryContactIds": []
        }

        mockRepository.getMatchingContacts.mockResolvedValue([]);

        mockRepository.createPrimaryContact.mockResolvedValue(Contact1);

        const res = await service.identify("mcfly@hillvalley.edu","123456");

        validateResponse(res,expected);

    });


    it("When the provided contact's email or phone number exists then create secondary contacts", async ()=>{
        const Contact1:Contact = {
          "id":1,
          "email": "lorraine@hillvalley.edu",
          "phoneNumber": "123456",
          "linkPrecedence":"primary",
          "createdAt": new Date(),
          "updatedAt": new Date()
        }

        const Contact2:Contact = {
          "id":23,
          "email": "mcfly@hillvalley.edu",
          "phoneNumber": "123456",
          "linkedId":1,
          "linkPrecedence":"secondary",
          "createdAt": new Date(),
          "updatedAt": new Date()
        }

        const expected:ContactInfo = {
          "primaryContactId":1,
          "emails": ["lorraine@hillvalley.edu","mcfly@hillvalley.edu"],
          "phoneNumbers": ["123456"],
          "secondaryContactIds": [23]
        }

        mockRepository.getMatchingContacts.mockResolvedValue([Contact1]);

        mockRepository.getContactsById.mockResolvedValue([Contact1]);

        mockRepository.createSecondaryContact.mockResolvedValue(Contact2);

        const res1 = await service.identify("mcfly@hillvalley.edu","123456");

        const res2 = await service.identify("lorraine@hillvalley.edu",null);

        const res3 = await service.identify("mcfly@hillvalley.edu",null);

        const res4 = await service.identify(null,"123456");

        validateResponse(res1,expected);

        validateResponse(res2,expected);

        validateResponse(res3,expected);

        validateResponse(res4,expected);

    })

    it("Turn primary to secondary contacts - oldest contact should remain primary",async()=>{
        const Contact1:Contact = {
          "id":11,
          "email": "george@hillvalley.edu",
          "phoneNumber": "919191",
          "linkPrecedence":"primary",
          "createdAt": new Date(),
          "updatedAt": new Date(),
          "deletedAt": null
        }

        const Contact2:Contact = {
          "id":27,
          "email": "biffsucks@hillvalley.edu",
          "phoneNumber": "717171",
          "linkPrecedence":"primary",
          "createdAt": new Date(),
          "updatedAt": new Date(),
          "deletedAt": null
        }

        const expected:ContactInfo = {
          "primaryContactId":11,
		      "emails": ["george@hillvalley.edu","biffsucks@hillvalley.edu"],
		      "phoneNumbers": ["919191","717171"],
		      "secondaryContactIds": [27]
        }

        mockRepository.getMatchingContacts.mockResolvedValue([Contact1, Contact2]);

        mockRepository.primaryToSecondaryHandler.mockResolvedValue([Contact1, Contact2]);

        const res = await service.identify("george@hillvalley.edu","717171");

        validateResponse(res,expected);
    })


    it("Link the contacts when a contact matches with different contacts information",async()=>{
        
      const Contact1:Contact = {
          "id":1,
          "email": "lorraine@hillvalley.edu",
          "phoneNumber": "123456",
          "linkPrecedence":"primary",
          "createdAt": new Date(),
          "updatedAt": new Date()
        }

        const Contact2:Contact = {
          "id":23,
          "email": "mcfly@hillvalley.edu",
          "phoneNumber": "123456",
          "linkedId":1,
          "linkPrecedence":"secondary",
          "createdAt": new Date(),
          "updatedAt": new Date()
        }

      const Contact3:Contact = {
          "id":11,
          "email": "george@hillvalley.edu",
          "phoneNumber": "919191",
          "linkPrecedence":"primary",
          "createdAt": new Date(),
          "updatedAt": new Date(),
          "deletedAt": null
        }

        const Contact4:Contact = {
          "id":27,
          "email": "biffsucks@hillvalley.edu",
          "phoneNumber": "717171",
          "linkedId":11,
          "linkPrecedence":"secondary",
          "createdAt": new Date(),
          "updatedAt": new Date(),
          "deletedAt": null
        }

        const expected:ContactInfo = {
          "primaryContactId":1,
		      "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu", "george@hillvalley.edu","biffsucks@hillvalley.edu"],
		      "phoneNumbers": ["123456","919191","717171"],
		      "secondaryContactIds": [11,23,27]
        }

        mockRepository.getMatchingContacts.mockResolvedValue([Contact1,Contact2,Contact3,Contact4]);

        jest.spyOn((service as any),"multiplePrimaryAndSecondaryHandler").mockResolvedValue([Contact1,Contact2,Contact3,Contact4]);

        const res = await service.identify("biffsucks@hillvalley.edu","123456");

        validateResponse(res,expected);
        
    })

})