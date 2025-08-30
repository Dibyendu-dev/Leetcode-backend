import { z } from "zod";
import {
  SubmissionLanguage,
  SubmissionStatus,
} from "../model/submission.model";

export const createSubmissionSchema = z.object({
  problemId: z.string().min(1, "problem id is rtequired"),
  code: z.string().min(1, "code id is rtequired"),
  language: z.nativeEnum(SubmissionLanguage, {
    errorMap: () => ({ message: "language is cpp or python" }),
  }),
});

export const updateSubmissionSchema = z.object({
  status: z.nativeEnum(SubmissionStatus, {
    errorMap: () => ({ message: "status must be pending or completed" }),
  }),
  submissionData: z.any(),
});


export const submissionQuerySchema = z.object({
    status: z.nativeEnum(SubmissionStatus).optional(),
    language: z.nativeEnum(SubmissionLanguage).optional(),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
    page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional()
})