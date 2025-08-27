import { IProblem } from "../models/problem.model";
import { IProblemRepositiry } from "../repository/problem.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { sanitisedMarkdown } from "../utils/markdown.sanitizer";
import { createProblemDTO, updateProblemDTO } from "../validators/problem.validator";


export interface IProblemService {
    createProblem(problem: createProblemDTO): Promise<IProblem>;
    getProblemById(id: string): Promise<IProblem | null>;
    getAllProblems(): Promise<{ problems: IProblem[]; total: number }>;
      updateProblem(
        id: string,
        updateData: updateProblemDTO
      ): Promise<IProblem | null>;
      deleteProblem(id: string): Promise<boolean>;
      findByDifficulty(difficulty: "easy" | "medium" | "hard"): Promise<IProblem[]>;
      searchProblem(query: string): Promise<IProblem[]>;
}

export class ProblemService implements IProblemService {

    private problemRepository: IProblemRepositiry;

    constructor( problemRepository: IProblemRepositiry){
        this.problemRepository = problemRepository;
    }

    async createProblem(problem: createProblemDTO): Promise<IProblem> {
        
        const sanitisedPayload = {
            ...problem,
            description: await sanitisedMarkdown(problem.description),
            editorial: problem.editorial && await sanitisedMarkdown(problem.editorial)
        }
        return await this.problemRepository.createProblem(sanitisedPayload);
    }

    async getProblemById(id: string): Promise<IProblem | null> {
        const problem = await this.problemRepository.getProblemById(id);
        if(!problem){
            throw new NotFoundError("problem not found");
        }
        return problem;
    }

    async getAllProblems(): Promise<{ problems: IProblem[]; total: number; }> {
        return await this.problemRepository.getAllProblems();
    }

    async updateProblem(id: string, updateData: updateProblemDTO): Promise<IProblem | null> {
        
        const problem = await this.problemRepository.getProblemById(id);
         if(!problem){
            throw new NotFoundError("problem not found");
        }

        const sanitisedPayload: Partial<IProblem>= {
            ...updateData
        }

        if (updateData.description) {
            sanitisedPayload.description = await sanitisedMarkdown(updateData.description);
        }

        if(updateData.editorial) {
            sanitisedPayload.editorial = await sanitisedMarkdown(updateData.editorial);
        }

        return await this.problemRepository.updateProblem(id, sanitisedPayload)
    }

    async deleteProblem(id: string): Promise<boolean> {
        const result = await this.problemRepository.deleteProblem(id);
        if(!result){
            throw new NotFoundError("problem not found");
        }
        return result;
    }

    async findByDifficulty(difficulty: "easy" | "medium" | "hard"): Promise<IProblem[]> {
        return await this.problemRepository.findByDifficulty(difficulty);
    }

    async searchProblem(query: string): Promise<IProblem[]> {
        if(!query || query.trim() === ""){
            throw new BadRequestError("query is required");
        }
        return await this.problemRepository.searchProblem(query)
    }
} 
