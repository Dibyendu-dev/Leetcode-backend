import { Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constant";
import logger from "../config/logger.config";
import { getRedisConnObject } from "../config/redis.config";
import { EvaluationJob, EvaluationResult, TestCase } from "../interface/evaluation.interface";
import { runCode } from "../utils/container/codeRunner.util";
import { language_config } from "../config/language.config";

function matchTestcasesWithResults(testcases: TestCase[], results: EvaluationResult[]){

    const output: Record<string, string> = {};

    if (results.length !== testcases.length){
        console.log("WA");
        return;
    }

    testcases.map((testcase,index) =>{
        let retval = '';
        if(results[index].status === "time_limit_exceeded"){
            retval= "TLE";
        } else if(results[index].status === "failed") {
            retval = "Error";
        } else {
            if(results[index].status === testcase.output){
                retval = "AC";
            } else {
                retval = "WA"
            }
        }

        console.log("retval",retval);
        output[testcase._id] = retval;
    })
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

