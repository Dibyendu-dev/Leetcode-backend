import Docker from "dockerode";
import logger from "../../config/logger.config";

export interface CreateContainerOptions {
    imageName: string;
    cmdExexutable: string[];
    memoryLimit: number;
}

export async function createNewDockerContainer(options: CreateContainerOptions) {
    try {

        const docker = new Docker();

        const container = await docker.createContainer({
            Image: options.imageName,
            Cmd: options.cmdExexutable,
            AttachStdin:true,
            AttachStdout: true,
            AttachStderr:true,
            Tty:false,
            OpenStdin: true,
            HostConfig: {
                Memory: options.memoryLimit,
                PidsLimit: 100,
                CpuQuota: 50000,
                CpuPeriod: 100000,
                SecurityOpt:['no-new-privileges'],
                NetworkMode: 'none',
            }
        })

        logger.info (`container created with id ${container.id}`)
        return container;
    } catch (error) {
        logger.error("error creating docker container",error)
        return null;
    }
}   