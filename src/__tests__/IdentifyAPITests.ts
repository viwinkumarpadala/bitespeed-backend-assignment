import request from "supertest";
import app from "../index";
import Logger from "../utils/Logger";

describe("Test identify api endpoint",()=>{
    
    test("POST request for /identify route with credentials in correct format",async()=>{

        const res = await request(app).post("/identify").send({
            email: "mcfly@hillvalley.edu",
            phoneNumber: "123456"
        }).expect(200);

        Logger.info(`res:${JSON.stringify(res)}`);

        expect(res.body.contact.emails).toContain("mcfly@hillvalley.edu");

        expect(res.body.contact.phoneNumbers).toContain("123456");
    })

    test("POST request with missing credentials",async()=>{
        const res = await request(app).post("/identify")
        .send({})
        .expect(400);

        Logger.info(`res:${JSON.stringify(res)}`);
    })

    test("Post request with invalid email", async()=>{
        const res = await request(app).post("/identify")
        .send({
            email: "ab",
            phoneNumber: "123456"
        })
        .expect(400);

        expect(res.body.error).toEqual("Provide a valid email")
    })

    test("Post request with invalid phone number", async()=>{
        const res = await request(app).post("/identify")
        .send({
            email: "abc@gmail.com",
            phoneNumber: "abcdef"
        })
        .expect(400);

        expect(res.body.error).toEqual("Provide a valid phone number (digits only)")
    })

})