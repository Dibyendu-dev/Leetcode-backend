import axios, { AxiosResponse } from "axios";
import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { InternalServerError } from "../utils/errors/app.error";

export interface ITestcase {
  input: string;
  output: string;
}

export interface IProblemDetails {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  editorial?: string;
  testcases: ITestcase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblemResponse {
  data: IProblemDetails;
  message: string;
  success: boolean;
}

export async function getProblemById(
  problemId: string
): Promise<IProblemDetails | null> {
  try {
    const url = `${serverConfig.PROBLEM_SERVICE}/problem/${problemId}`;
    logger.info("getting problem id", { url });

    const response: AxiosResponse<IProblemResponse> = await axios(url);

    if (response.data.success) {
      return response.data.data;
    }
    throw new InternalServerError("failed to get problem details");
  } catch (error) {
    logger.error(`failed to get problem details,${error}`);
    return null;
  }
}
