import {Assets} from "../components/assets";
import {
  Inject,
  Produces,
  Action,
  Controller,
  Param,
  Request,
  ErrorMessage,
  ServerError, StatusCodes
} from "@typeix/rexxar";
import {getType} from "mime";
/**
 * Controller example
 * @constructor
 * @function
 * @name CoreController
 *
 * @description
 * Define controller, assign action and inject your services.
 * Each request create new instance of controller, your Injected type is injected by top level injector if is not defined
 * as local instance as providers to this controllers
 *
 * Controllers can be Inherited by thy don't necessary need's to be inherited
 */
@Controller({
  name: "core",
  providers: [] // type of local instances within new request since controller is instanciated on each request
})
export class CoreController {

  /**
   * @param {Assets} assetLoader
   * @description
   * Custom asset loader service
   */
  @Inject(Assets)
  assetLoader: Assets;
  /**
   * @param {Request} request
   * @description
   * ControllerResolver reflection
   */
  @Inject(Request)
  request: Request;
  /**
   * @param {HttpError} message
   * @description
   * Error route handler
   */
  @Action("error")
  actionError(@ErrorMessage error: ServerError) {
    return "ERROR -> " + error.getCode() + " : " + error.getMessage();
  }

  /**
   * @param {HttpError} message
   * @description
   * Error route handler
   */
  @Action("fire")
  actionFireError() {
    throw new ServerError(500, "ERROR FIRE");
  }
  /**
   * @function
   * @name fileLoadAction
   *
   * @description
   * This action loads file from disk
   * \@Produces("image/x-icon") -> content type header
   */
  @Produces("image/x-icon")
  @Action("favicon")
  faviconLoader(): Promise<Buffer> {
    return this.fileLoadAction("favicon.ico");
  }

  /**
   * @function
   * @name fileLoadAction
   *
   * @description
   * This action loads file from disk
   *
   */
  @Action("assets")
  fileLoadAction(@Param("file") file: string): Promise<Buffer> {
    let type = getType(Assets.publicPath(file));
    this.request.setContentType(type);
    return this.assetLoader.load(file);
  }


  /**
   * @function
   * @name dynamicRouterExample
   *
   * @description
   * Dynamic router example
   */
  @Action("not_found")
  @Produces("application/json")
  dynamicRouterExample(): string {
    this.request.setStatusCode(StatusCodes.Not_Found);
    let params = {
      message: "NOT FOUND WITH DYNAMIC ROUTER EXAMPLE",
      params: this.request.getParams()
    };
    return JSON.stringify(params);
  }

}
