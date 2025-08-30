import { getProblemById } from "../api/problem.api";
import logger from "../config/logger.config";
import {
  ISubmission,
  ISubmissionData,
  SubmissionStatus,
} from "../model/submission.model";
import { addSubmissionJob } from "../producer/submission.producer";
import { ISubmissionRepository } from "../repository/submission.repository";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  
} from "../utils/errors/app.error";

export interface ISubmissionService {
  createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission>;
  findSubmissionById(id: string): Promise<ISubmission | null>;
  findSubmissionByProblemId(problemId: string): Promise<ISubmission[]>;
  deleteSubmissionById(id: string): Promise<boolean>;
  updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    submissionData: ISubmissionData
  ): Promise<ISubmission | null>;
}

export class SubmissionService implements ISubmissionService {
  private submissionRepository: ISubmissionRepository;

  constructor(submissionRepository: ISubmissionRepository) {
    this.submissionRepository = submissionRepository;
  }

  async createSubmission(
    submissionData: Partial<ISubmission>
  ): Promise<ISubmission> {
    // check if problem exsist
    // add the submission payload to db
    // submission to redis queue

    if (!submissionData.problemId) {
      throw new BadRequestError("problem id is required ");
    }

    if (!submissionData.code) {
      throw new BadRequestError("code is required ");
    }

    if (!submissionData.language) {
      throw new BadRequestError("language is required ");
    }

    logger.info("getting problem id", { problemId: submissionData.problemId });

    const problem = await getProblemById(submissionData.problemId);

    if (!problem) {
      throw new NotFoundError("problem not found");
    }

    const submission = await this.submissionRepository.create(submissionData);

    if (!submission || !submission.id) {
      throw new InternalServerError("Failed to create submission");
    }

    const jobId = await addSubmissionJob({
      submissionId: submission.id,
      problem,
      code: submissionData.code,
      language: submissionData.language,
    });

    if (!jobId) {
      logger.warn("Failed to add submission job to queue", {
        submissionId: submission.id,
      });
      // Don't throw error here as the submission is already created
    } else {
      logger.info(`submission job added ${jobId}`);
    }

    return submission;
  }

  async findSubmissionById(id: string): Promise<ISubmission | null> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundError("submission not found");
    }
    return submission;
  }

  async findSubmissionByProblemId(problemId: string): Promise<ISubmission[]> {
    const submissions = await this.submissionRepository.findByProblemId(
      problemId
    );
    return submissions;
  }

  async deleteSubmissionById(id: string): Promise<boolean> {
    const result = await this.submissionRepository.deleteById(id);
    return result;
  }

  async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    submissionData: ISubmissionData
  ): Promise<ISubmission | null> {
    const submission = await this.submissionRepository.updateStatus(
      id,
      status,
      submissionData
    );
    if (!submission) {
      throw new NotFoundError("submission not found");
    }
    return submission;
  }
}
