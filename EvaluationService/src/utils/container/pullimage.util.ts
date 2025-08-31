import Docker from "dockerode";
import { CPP_IMAGE, PYTHON_IMAGE } from "../constant";
import logger from "../../config/logger.config";

export async function pullImage(image: string) {
  const docker = new Docker();

  return new Promise((res, rej) => {
    docker.pull(image, (err: Error, stream: NodeJS.ReadableStream) => {
      if (err) {
        rej(err);
        return;
      }

      docker.modem.followProgress(
        stream,
        function onFinished(FinalErr, output) {
          if (FinalErr) return rej(FinalErr);
          res(output);
        },
        function onProgress(event) {
          console.log(event.status);
        }
      );
    });
  });
}

export async function pullAllImage() {
  const images = [PYTHON_IMAGE,CPP_IMAGE];

  const promises = images.map((image) => pullImage(image));

  try {
    await Promise.all(promises);
    logger.info("All images pulled successfully");
  } catch (error) {
    logger.error("error pulling image",error);
  }
}
