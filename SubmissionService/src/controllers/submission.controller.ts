import { NextFunction, Request, Response } from "express";
import { SubmissionService } from "../service/submission.service";
import logger from "../config/logger.config";

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor(submissionService: SubmissionService) {
    this.submissionService = submissionService;
  }

  createSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("Creating new submission", { body: req.body });
      const submission = await this.submissionService.createSubmission(
        req.body
      );
      logger.info("submission created successfully", {
        submissionId: submission.id,
      });

      res.status(201).json({
        success: true,
        message: "submission created successfully",
        data: submission,
      });
    } catch (error) {
      logger.error("Error creating submission", { error, body: req.body });
      next(error);
    }
  };

  findSubmissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const submission = await this.submissionService.findSubmissionById(id);

      logger.info("submission fetched successfully", { submissionId: id });

      res.status(200).json({
        success: true,
        message: "submission fetched successfully",
        data: submission,
      });
    } catch (error) {
      logger.error("Error fetching submission by ID", {
        error,
        id: req.params.id,
      });
      next(error);
    }
  };

  findSubmissionByProblemId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { problemId } = req.params;
      const submissions =
        await this.submissionService.findSubmissionByProblemId(problemId);

      logger.info("submissions fetched successfully", {
        problemId,
        count: submissions.length,
      });

      res.status(200).json({
        success: true,
        message: "submissions fetched successfully",
        data: submissions,
      });
    } catch (error) {
      logger.error("Error fetching submissions by problem ID", {
        error,
        problemId: req.params.problemId,
      });
      next(error);
    }
  };

  deleteSubmissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.submissionService.deleteSubmissionById(id);

      logger.info("submission deleted successfully", { submissionId: id });

      res.status(200).json({
        success: true,
        message: "submissions deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting submission", { error, id: req.params.id });
      next(error);
    }
  };

  updateSubmissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
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
    } catch (error) {
      logger.error("Error updating submission", {
        error,
        id: req.params.id,
        body: req.body,
      });
      next(error);
    }
  };
}
