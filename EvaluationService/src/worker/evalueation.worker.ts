import { Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constant";
import logger from "../config/logger.config";
import { getRedisConnObject } from "../config/redis.config";


async function setupEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async(job) => {
        logger.info(`processing job ${job.id}`);
    },{
        connection: getRedisConnObject()
    });

    worker.on("error", (error) => {
        logger.error( `evaliation worker error: ${error}`)
    })

    worker.on("completed", (job) => {
        logger.error( `evaliation worker completed ${job}`)
    })

    worker.on("failed", (job,error) => {
        logger.error( `evaliation worker failed: ${job}`,error)
    })
}

export async function startWorkers() {
    setupEvaluationWorker();
}

