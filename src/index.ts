import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Logger from "./utils/logger";

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(cors());

app.use(express.json());

app.listen(PORT,()=>{
    Logger.info(`Server is listening to port: ${PORT} `);
});

export default app;