import { CPP_IMAGE, PYTHON_IMAGE } from "../utils/constant";


export const language_config = {
    python: {
        timeout : 5000,
        imageName: PYTHON_IMAGE,
    },
    cpp: {
        timeout: 1000,
        imageName: CPP_IMAGE
    }
}