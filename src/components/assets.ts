import {readFile} from "fs";
import {normalize} from "path";
import {isDefined, Injectable} from "@typeix/rexxar";

/**
 * Asset loader service
 * @constructor
 * @function
 * @name Assets
 *
 * @description
 * Load assets from disk
 */
@Injectable()
export class Assets {
  /**
   * Get public path
   * @return {String}
   */
  static publicPath(name: string): string {
    name = normalize(name);
    return normalize(process.cwd() + process.env.ASSETS_PATH + name);
  }

  /**
   * Load asset from disk
   * @param name
   * @return {Promise<Buffer>}
   */
  async load(name: string): Promise<Buffer> {
    return await <Promise<Buffer>> new Promise(
      (resolve, reject) => {
        try {
          readFile(
            Assets.publicPath(name),
            (err, data) => isDefined(err) ? reject(err) : resolve(data)
          )
        } catch (e) {
          reject(e);
        }
      }
    );
  }
}
