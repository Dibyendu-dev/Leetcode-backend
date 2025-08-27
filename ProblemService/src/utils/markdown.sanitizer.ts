import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import TurndownService from "turndown";
import logger from "../config/logger.config";

export async function sanitisedMarkdown (markdown: string): Promise<string> {

    if (!markdown || typeof markdown !== "string"){
        return "";
    }

    try {

        const convertedHtml = await marked.parse(markdown);

        const sanitizedHtml = sanitizeHtml(convertedHtml, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img","pre","code"]),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                "img": ["src","alt","title"],
                "code":["class"],
                "pre": ["class"],
                "a": ["herf","target"]
            },
            allowedSchemes: ["http","https"],
            allowedSchemesByTag: {
                "img": ["http","https"]
            }
        })

        const tds = new TurndownService();

        return tds.turndown(sanitizedHtml);
    } catch (error) {
        logger.error("error sanitizing markdown", error)
        return ""
    }
}
