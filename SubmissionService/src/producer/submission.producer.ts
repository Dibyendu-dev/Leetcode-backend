import { IProblemDetails } from "../api/problem.api";
import logger from "../config/logger.config";
import { submissionQueue } from "../queues/submission.queue";

export interface ISubmissionJob {
  submissionId: string;
  problem: IProblemDetails;
  code: string;
  language: string;
}

export async function addSubmissionJob(
  data: ISubmissionJob
): Promise<string | null> {
  try {
    const job = await submissionQueue.add("evaluate-submission", data);

    logger.info(`submission job added: ${job.id}`);

    return job.id || null;
  } catch (error) {
    logger.error(`failed to add submission job ${error}`);
    return null;
  }
}
