import {Assets} from "../components/assets";
import {Inject, Action, Controller, Request, Chain, BeforeEach, Param, Router, StatusCodes, uuid} from "@typeix/rexxar";
import {Cache} from "../filters/cache";
import {CoreController} from "./core";
import {TemplateEngine} from "../components/template-engine";
import {ArticleModel} from "../components/models/article";
import {util} from "tinymce";
import JSON = util.JSON;

/**
 * Controller example
 * @constructor
 * @function
 * @name HomeController
 *
 * @description
 * Define controller, assign action and inject your services.
 * Each request create new instance of controller, your Injected type is injected by top level injector if is not defined
 * as local instance as providers to this controllers.
 *
 * Controllers can be Inherited by thy don't necessary need's to be inherited
 */
@Controller({
  name: "home",
  filters: [Cache]
})
export class HomeController extends CoreController {

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
   * @param {Router} router
   * @description
   * Router reflection
   */
  @Inject(Router)
  router: Router;
  /**
   * @param {TemplateEngine} engine
   * @description
   * Inject template engine
   */
  @Inject(TemplateEngine)
  engine: TemplateEngine;

  /**
   * @function
   * @name redirect
   *
   * @description
   * Redirection example
   */
  @Action("redirect")
  async redirect() {
    let url = await this.router.createUrl("home/index", {});
    return this.request.redirectTo(url, StatusCodes.Temporary_Redirect);
  }

  /**
   * @function
   * @name actionId
   *
   * @description
   * There is no naming convention of function names only what is required to define action is \@Action metadata
   *
   */
  @Action("id")
  actionId(
      @Param("id") id: number,
      @Chain data: string,
      @Param("name") name: string): Promise<string> {
    return this.engine.compileAndRender("home_id", {
      data,
      id,
      name,
      title: "Template engine with typeix"
    });
  }

  /**
   * @function
   * @name BeforeEach
   *
   * @description
   * before each action chain, action chains in following order if annotations are pressent
   *
   * \@FiltersInOrderBefore -> \@BeforeEach -> \@Before(action) -> \@Action(action) -> \@After(action) -> \@AfterEach -> \@FiltersInOrderAfter
   * Chain can be stopped at any level, chains are not required to be implemented !
   * Frameworks only search for \@Action("name")
   */
  @BeforeEach
  beforeEachAction(@Chain data: string): string {
    return "Before each core <- " + data;
  }
  /**
   * @function
   * @name beforeIndex
   *
   * @description
   * Before index action chain
   *
   * \@FiltersInOrderBefore -> \@BeforeEach -> \@Before(action) -> \@Action(action) -> \@After(action) -> \@AfterEach -> \@FiltersInOrderAfter
   * Chain can be stopped at any level, chains are not required to be implemented !
   * Frameworks only search for \@Action("name")
   */
  @Action("index")
  beforeIndex(@Chain data: string): Promise<string> {
    return this.engine.compileAndRender("home_id", {
      data,
      id: "NO_ID",
      name: "this is home page",
      title: "Home page example"
    });
  }


  @Inject(ArticleModel)
  articleModel: ArticleModel;

  @Action("article")
  async actionArticleHandler() {
    let data = await this.articleModel.create({
      _id: uuid(),
      created: new Date,
      meta_title: "MTitle",
      meta_description: "MDesc",
      title: "Title",
      short_description: "Short Desc",
      description: "Desc"
    });
    return JSON.stringify(data);
  }

}
