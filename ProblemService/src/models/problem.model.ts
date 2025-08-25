import mongoose, {Document} from "mongoose";

export interface IProblem extends Document {
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    editorial?: string;
    testcases: ITestcase[],
    createdAt: Date,
    updatedAt: Date,
}

export interface ITestcase {
    input: string;
    output: string;
}

const testSchema = new mongoose.Schema<ITestcase> ({
    input: {
        type: String,
        required: [true, "Input is required"],
        trim: true,
    },
    output: {
         type: String,
        required: [true, "Output is required"],
        trim: true,
    }
})

const problemSehema = new mongoose.Schema<IProblem> ({
    title: {
        type: String,
        required: [true, "Title is required" ],
        maxLength: [100, "title must be less than 100 characters"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description is required" ],
        trim: true,
    },
    difficulty: {
        type: String,
        enum: {
            values: ["easy","medium","hard"],
            message: "Invalid difficulty level",
        },
        default: "easy",
        required: [true, "Difficulty level is required" ],
    },
    editorial: {
        type: String,
        trim: true,
    },
    testcases: [testSchema],
},{
    timestamps: true,
    toJSON: {
        transform: (_,record) =>{
            delete (record as any).v;
            record.id = record._id;
            delete record.id;
            return record;
        }
    }
});

problemSehema.index({title: 1}, {unique: true});
problemSehema.index({difficulty: 1});

export const Problem = mongoose.model<IProblem>("Problem",problemSehema);
