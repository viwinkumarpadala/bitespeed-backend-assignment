import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Logger from "./utils/Logger";
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
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

const swaggerDocument = fs.readFileSync(path.join(__dirname, "../src/docs/identify.yaml"), 'utf8');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(JSON.parse(JSON.stringify(require('js-yaml').load(swaggerDocument)))));

app.use("/identify",contactRouter);

app.listen(PORT,()=>{
    Logger.info(`Server is listening to port: ${PORT} `);
});

export default app;