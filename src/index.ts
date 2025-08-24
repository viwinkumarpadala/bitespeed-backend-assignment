import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Logger from "./utils/Logger";
import { ContactRepository } from "./repositories/ContactRepository";
import { ContactService } from "./services/ContactService";
import { ContactController } from "./controllers/ContactController";
import { ContactRouter } from "./routes/ContactRoute";

dotenv.config();
const PORT = process.env.PORT;

const contactRepository = new ContactRepository();

const contactService = new ContactService(contactRepository);

const contactController = new ContactController(contactService);

const contactRouter = ContactRouter(contactController);

const app = express();

app.use(cors());

app.use(express.json());

app.listen(PORT,()=>{
    Logger.info(`Server is listening to port: ${PORT} `);
});

export default app;