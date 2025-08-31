import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { startWorkers } from './worker/evalueation.worker';
import { pullAllImage} from './utils/container/pullimage.util';
import { createNewDockerContainer } from './utils/container/createContainer';
import { PYTHON_IMAGE } from './utils/constant';
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); 


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, async() => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);
    await startWorkers();
    logger.info("worker started successfully");
    await pullAllImage();
    console.log("image pulled successfully")

    // await createNewDockerContainer({
    //     imageName: PYTHON_IMAGE,
    //     cmdExexutable: ['/bin/bash','-c','tail -f /var/log/dmesg'],
    //     memoryLimit: 1024*1024*1024
    // })
});
