import { Response, Request } from "express";
import { ProblemService } from "../service/problem.service";
import { ProblemRepository } from "../repository/problem.repository";

const problemRepository = new ProblemRepository()
const problemService = new ProblemService(problemRepository);

export const ProblemRouter = {

    async createProblem(req:Request, res:Response):Promise<void> {

        const problem = await problemService.createProblem(req.body);

        res.status(201).json({
            message: "problem created successfully",
            data: problem,
            success: true,
        })
    },

    async  getProblemById(req:Request, res:Response):Promise<void> {

         const problem = await problemService.getProblemById(req.params.id);

         res.status(200).json({
            message: "problem fetched successfully",
            data: problem,
            success: true,
        })
    },

    async getAllProblems (req:Request, res:Response):Promise<void> {

        const problems = await problemService.getAllProblems();

         res.status(200).json({
            message: "problem fetched successfully",
            data: problems,
            success: true,
        })
    },

    async updateProblem(req:Request, res:Response):Promise<void> {

        const problem = await problemService.updateProblem(req.params.id,req.body);

        res.status(200).json({
            message: "Problem updated successfully",
            data: problem,
            success: true
        });
    },

    async deleteProblem (req:Request, res:Response):Promise<void> {

        const problem = await problemService.deleteProblem(req.params.id);
        
          res.status(200).json({
            message: "Problem deleted successfully",
            data: problem,
            success: true
        });
    },

    async findByDifficulty (req:Request, res:Response): Promise<void> {

        const difficulty = req.params.difficulty as "easy" | "medium" | "hard";

        const problems = await problemService.findByDifficulty(difficulty);

         res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
            success: true
        });
    },

    async searchProblems  (req:Request, res:Response): Promise<void> {

        const problems = await problemService.searchProblem(req.query.query as string);

         res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
            success: true
        });
    },
}