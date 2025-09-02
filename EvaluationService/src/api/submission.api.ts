import axios from "axios";
import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { InternalServerError } from "../utils/errors/app.error";


export async function updateSubmission(submissionId: string, status:string, output: Record<string,string>) {

   try {
    const url = `${serverConfig.SUBMISSION_SERVICE}/submission/${submissionId}/status`;
    logger.info("getting submission id", { url });

    const response = await axios.patch(url, {
        status,
        submissionData: output
    });

    if (response.status !== 200) {
      throw new InternalServerError("failed to update submission");
    }

    console.log("submission updated successfully", response.data);
    return;
   
  } catch (error) {
    logger.error(`failed to  update submission,${error}`);
    return null;
  }
}