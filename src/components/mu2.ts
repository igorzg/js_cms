import {normalize} from "path";
import {Injectable, isUndefined} from "@typeix/rexxar";
import {compileAndRender} from "mu2";

if (isUndefined(process.env.BUILD_PATH)) {
  process.env.BUILD_PATH = "/build/";
}

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
  static getTemplatePath(name: String, path?: string): string {
    return normalize(process.cwd() + process.env.BUILD_PATH + (isUndefined(path) ? "views/" : path) + name + ".mustache");
  }

  /**
   * Load template from disk
   * @param template
   * @param data
   * @param path
   * @returns {NodeJS.ReadableStream}
   */
  compileAndRender(template: String, data: any, path?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer = "";
      compileAndRender(TemplateEngine.getTemplatePath(template, path), data)
        .on("data", (chunk) => buffer += chunk.toString())
        .on("error", error => reject(error))
        .on("end", () => resolve(buffer));
    });
  }
}
