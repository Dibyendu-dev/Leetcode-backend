import mongoose from "mongoose";
import { serverConfig } from ".";
import logger from "./logger.config";
import { error } from "console";


export const connectDB = async () =>{
    try {
        const dbUrl = serverConfig.DB_URL;

        await mongoose.connect(dbUrl);

        logger.info("connected to mongodb successfully"); 

        mongoose.connection.on("error", ()=>{
            logger.error("mongodb connection error",error);
        })
        mongoose.connection.on("disconnected",()=>{
            logger.warn("mongodb disconnected");
        })

        process.on("SIGINT", async()=>{
            await mongoose.connection.close();
            logger.info("mongodb connection closed");
            process.exit(0);
        })
    } catch (error) {
        logger.error("failed to connect mongodb");
        process.exit(1);
    }
}