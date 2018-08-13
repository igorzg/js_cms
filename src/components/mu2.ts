import {normalize} from "path";
import {Injectable} from "@typeix/rexxar";
import {compileAndRender} from "mu2";


/**
 * Template engine
 * @constructor
 * @function
 * @name TemplateEngine
 *
 * @description
 * Load and compile templates from disk
 */
@Injectable()
export class TemplateEngine {
    /**
     * Gets template path
     * @return {String}
     */
    static getTemplatePath(name: String): string {
        return normalize(process.cwd() + "/views/" + name + ".mustache");
    }

    /**
     * Load template from disk
     * @param template
     * @param data
     * @returns {NodeJS.ReadableStream}
     */
    compileAndRender(template: String, data: any): Promise<string> {
        return new Promise((resolve, reject) => {
            let buffer = "";
            compileAndRender(TemplateEngine.getTemplatePath(template), data)
                .on("data", (chunk) => buffer += chunk.toString())
                .on("error", error => reject(error))
                .on("end", () => resolve(buffer));
        });
    }
}
