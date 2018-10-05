import {normalize} from "path";
import {renderFile} from "twig";
import {Injectable, isUndefined, Inject, Logger} from "@typeix/rexxar";

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

  @Inject(Logger)
  private logger: Logger;
  /**
   * Gets template path
   * @return {String}
   */
  static getTemplatePath(name: String, path?: string): string {
    return normalize(process.cwd() + process.env.TEMPLATE_PATH + (isUndefined(path) ? "views/" : path) + name + ".twig");
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
      let templatePath = TemplateEngine.getTemplatePath(template, path);
      this.logger.debug("Loading template path", {templatePath, data})
      try {
        renderFile(
          templatePath,
          data,
          (error, html) => {
            if (error) {
              reject(error);
            } else {
              resolve(html);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}
