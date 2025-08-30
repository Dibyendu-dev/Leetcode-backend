import express from "express";
import { SubmissionFactory } from "../../factory/submission.factory";
import { validateQueryParams, validateRequestBody } from "../../validators";
import {
  createSubmissionSchema,
  submissionQuerySchema,
  updateSubmissionSchema,
} from "../../validators/submission.validator";

const submissionRouter = express.Router();

const submissionController = SubmissionFactory.getSubmissionController();

submissionRouter.post(
  "/",
  validateRequestBody(createSubmissionSchema),
  submissionController.createSubmission
);

submissionRouter.get("/:id", submissionController.findSubmissionById);

submissionRouter.get(
  "/problem/:problemId",
  validateQueryParams(submissionQuerySchema),
  submissionController.findSubmissionByProblemId
);

submissionRouter.delete("/:id", submissionController.deleteSubmissionById);

submissionRouter.patch(
  "/:id/status",
  validateRequestBody(updateSubmissionSchema),
  submissionController.updateSubmissionById
);

export default submissionRouter;
