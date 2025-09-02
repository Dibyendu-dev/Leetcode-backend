import { Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constant";
import logger from "../config/logger.config";
import { getRedisConnObject } from "../config/redis.config";
import { EvaluationJob, EvaluationResult, TestCase } from "../interface/evaluation.interface";
import { runCode } from "../utils/container/codeRunner.util";
import { language_config } from "../config/language.config";
import { updateSubmission } from "../api/submission.api";

function matchTestcasesWithResults(testcases: TestCase[], results: EvaluationResult[]){

    const output: Record<string, string> = {};

    if (results.length !== testcases.length){
        console.log("WA (mismatch in testcase count)");
        return;
    }

    testcases.forEach((testcase, index) => {
        let retval = "";
        const result = results[index];

        if (result.status === "time_limit_exceeded") {
            retval = "TLE";
        } else if (result.status === "failed") {
            retval = "Error";
        } else {
            const expected = testcase.output ?? "";
            const actual = result.output ?? "";

            if (normalizeOutput(actual) === normalizeOutput(expected)) {
                retval = "AC";
            } else {
                retval = "WA";
            }
        }

        console.log(`Testcase ${testcase._id}: expected=${testcase.output}, actual=${results[index].output}, verdict=${retval}`);
        output[testcase._id] = retval;
    });

    return output;
}

function normalizeOutput(output: string): string {
    return output.trim().replace(/\r\n/g, "\n");
}

async function setupEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async(job) => {
        logger.info(`processing job ${job.id}`);

        const data: EvaluationJob = job.data;
        console.log("data:", data);

        try {
            
            const testcasesRunnerPromise = data.problem.testcases.map((testcase) => {
                return  runCode({
                    code: data.code,
                    language:data.language,
                    timeout: language_config[data.language].timeout,
                    imageName:  language_config[data.language].imageName,
                    input: testcase.input
                })
            })

            const testcasesRunnerResult:EvaluationResult[] = await Promise.all(testcasesRunnerPromise);
            console.log("testcasesRunnerResult", testcasesRunnerResult);

            const output = matchTestcasesWithResults(data.problem.testcases, testcasesRunnerResult);
            console.log("output",output);  

            await updateSubmission(data.submissionId, "completed", output  || {})

        } catch (error) {
            logger.error(`evaluation job failed: ${job}`, error);
            return
        }
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

