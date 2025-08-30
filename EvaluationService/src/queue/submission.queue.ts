import { Queue } from "bullmq";
import { getRedisConnObject } from "../config/redis.config";
import logger from "../config/logger.config";
import { SUBMISSION_QUEUE } from "../utils/constant";

export const submissionQueue = new Queue(SUBMISSION_QUEUE, {
  connection: getRedisConnObject(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

submissionQueue.on("error", (error) => {
  logger.error(`submission queue error : ${error}`);
});

submissionQueue.on("waiting", (job) => {
  logger.error(`submission job waiting : ${job.id}`);
});
