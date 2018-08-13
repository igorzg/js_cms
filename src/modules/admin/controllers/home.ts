import {Inject, Action, Controller, Request, Before, Chain, BeforeEach, ServerError, ErrorMessage} from "@typeix/rexxar";

/**
 * Controller example
 * @constructor
 * @function
 * @name HomeController
 *
 * @description
 * Define controller, assign action and inject your services.
 * Each request create new instance of controller, your Injected type is injected by top level injector if is not defined
 * as local instance as providers to this controllers
 */
@Controller({
  name: "home",
  providers: [] // type of local instances within new request since controller is instanciated on each request
})
export class HomeController {


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
    return "ADMIN -> ERROR -> " + error.getCode() + " : " + error.getMessage();
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
   * @name actionIndex
   *
   * @description
   * There is no naming convention of function names only what is required to define action is \@Action metadata
   *
   * @example
   * \@Action("index")
   *  iIgnoreNamingConvention(): string {
   *    return "Only important fact is a \@Action param";
   * }
   *
   */
  @Action("index")
  actionIndex(@Chain data: string): string {
    return `Action index: admin module <-` + data;
  }

  /**
   * @function
   * @name BeforeEach
   *
   * @description
   * before each
   *
   */
  @BeforeEach
  beforeEachAction(@Chain data: string): string {
    return "Before each admin module <- " + data;
  }

  /**
   * @function
   * @name actionIndex
   *
   * @description
   * There is no naming convention of function names only what is required to define action is \@Action metadata
   *
   * @example
   * \@Action("index")
   *  iIgnoreNamingConvention(): string {
   *    return "Only important fact is a \@Action param";
   * }
   *
   */
  @Before("index")
  beforeIndex(@Chain data: string): string {
    return "Before index admin module: <- " + data;
  }

}
