import { Request, Response } from "express";
import { SubmissionService } from "../service/submission.service";
import logger from "../config/logger.config";

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor(submissionService: SubmissionService) {
    this.submissionService = submissionService;
  }

  async createSubmission(req: Request, res: Response) {
    const submission = await this.submissionService.createSubmission(req.body);
    logger.info("submission created successfully", {
      submissionId: submission.id,
    });

    res.status(201).json({
      success: true,
      message: "submission created successfully",
      data: submission,
    });
  }

  async findSubmissionById(req: Request, res: Response) {
    const { id } = req.params;
    const submission = await this.submissionService.findSubmissionById(id);

    logger.info("submission fetched successfully", { submissionId: id });

    res.status(200).json({
      success: true,
      message: "submission fetched successfully",
      data: submission,
    });
  }

  async findSubmissionNyProblemId(req: Request, res: Response) {
    const { problemId } = req.params;
    const submissions = await this.submissionService.findSubmissionByProblemId(
      problemId
    );

    logger.info("submissions fetched successfully", {
      problemId,
      count: submissions.length,
    });

    res.status(200).json({
      success: true,
      message: "submissions fetched successfully",
      data: submissions,
    });
  }

  async deleteSubmissionById(req: Request, res: Response) {
    const { id } = req.params;
    await this.submissionService.deleteSubmissionById(id);

    logger.info("submission deleted successfully", { submissionId: id });

    res.status(200).json({
      success: true,
      message: "submissions deleted successfully",
    });
  }

  async updateSubmissionById(req: Request, res: Response) {
    const { id } = req.params;
    const { status, submissionData } = req.body;

    const submission = await this.submissionService.updateSubmissionStatus(
      id,
      status,
      submissionData
    );

    logger.info("submission status updated succesfully", {
      submissionId: id,
      status,
    });

    res.status(200).json({
      success: true,
      message: "submission data updated succesfully",
      data: submission,
    });
  }
}
