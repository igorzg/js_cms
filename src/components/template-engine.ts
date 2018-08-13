import {normalize} from "path";
import {renderFile} from "twig";
import {Injectable, isUndefined} from "@typeix/rexxar";

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
    return normalize(process.cwd() + process.env.BUILD_PATH + (isUndefined(path) ? "views/" : path) + name + ".twig");
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
      renderFile(
        TemplateEngine.getTemplatePath(template, path),
        data,
        (error, html) => {
          if (error) {
            reject(error);
          } else {
            resolve(html);
          }
        }
      );
    });
  }
}
