import {IAfterConstruct, Inject, Logger, LogLevels, RestMethods, Router, RootModule} from "@typeix/rexxar";
import {Assets} from "./components/assets";
import {CoreController} from "./controllers/core";
import {HomeController} from "./controllers/home";
import {AdminModule} from "./modules/admin/admin.module";
import {TemplateEngine} from "./components/template-engine";
import {InMemoryCache} from "./components/in-memory-cache";
import {DynamicRouteRule} from "./components/dynamic-router";
import {MongodbConnectionProvider} from "./components/mongodb-connection";
import {ArticleModel} from "./components/models/article";

/**
 * Application entry point
 * @constructor
 * @function
 * @name Application
 *
 * @description
 * \@Module is used to define application entry point class
 */
@RootModule({
  imports: [AdminModule], // bootstrap in recursive top level order
  controllers: [HomeController, CoreController], // no order
  providers: [Assets, TemplateEngine, InMemoryCache, ArticleModel],
  shared_providers: [
    {
      provide: Logger,
      useFactory: () => {
        let logger: Logger = new Logger();
        logger.enable();
        logger.printToConsole();
        logger.setDebugLevel(LogLevels.BENCHMARK);
        return logger;
      },
      providers: []
    },
    {
      provide: Router,
      useClass: Router,
      providers: [Logger, InMemoryCache]
    },
    {
      provide: MongodbConnectionProvider,
      useClass: MongodbConnectionProvider,
      providers: [
        {
          provide: "MONGODB_CONNECTION",
          useValue: (function () {
            if (process.env.MONGO_REPLICA) {
              return "mongodb://mongo-1:27017,mongo-2:27017,mongo-3:27017/cms?replicaSet=rs1&readPreference=secondary";
            }
            return  "mongodb://localhost:30001/cms?connectTimeoutMS=5000";
          }())
        }
      ]
    }
  ]
})
export class Application implements IAfterConstruct {

  /**
   * @param {Assets} assetLoader
   * @description
   * Custom asset loader service
   */
  @Inject(Assets)
  assetLoader: Assets;

  /**
   * @param {Logger} logger
   * @description
   * Logger service
   */
  @Inject(Logger)
  logger: Logger;

  /**
   * @param {Router} router
   * @description
   * Router service
   */
  @Inject(Router)
  router: Router;

  /**
   * @function
   * @name Application#afterConstruct
   *
   * @description
   * After construct use injected values to define some behavior at entry point
   * Defining main route, all routes are processed
   */
  afterConstruct() {

    this.logger.debug("SET system paths", {
      assetsPath: Assets.publicPath("*"),
      templatePath: TemplateEngine.getTemplatePath("*")
    });

    this.router.addRules([
      {
        methods: [RestMethods.GET],
        route: "core/favicon",
        url: "/favicon.ico"
      },
      {
        methods: [RestMethods.GET],
        route: "core/assets",
        url: "/assets/<file:(.*)>"
      },
      {
        methods: [RestMethods.GET],
        route: "home/id",
        url: "/<id:(\\d+)>/<name:(\\w+)>"
      },
      {
        methods: [RestMethods.GET],
        route: "home/id",
        url: "/<id:(\\d+)>"
      },
      {
        methods: [RestMethods.GET],
        route: "home/index",
        url: "/"
      },
      {
        methods: [RestMethods.GET],
        route: "home/article",
        url: "/article"
      },
      {
        methods: [RestMethods.GET],
        route: "home/redirect",
        url: "/redirect-to-home"
      },
      {
        methods: [RestMethods.GET],
        route: "core/error",
        url: "/throw-error"
      }
    ]);

    this.router.addRule(DynamicRouteRule);
    this.router.setError("core/error");
  }
}
