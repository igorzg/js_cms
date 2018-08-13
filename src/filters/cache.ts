import {IFilter, Filter, Request, Inject, Logger} from "@typeix/rexxar";
import {InMemoryCache} from "../components/in-memory-cache";

/**
 * @constructor
 * @function
 * @name Cache
 *
 * @description
 * Cache filter example
 */
@Filter(100)
export class Cache implements IFilter {

  /**
   * @param {Logger} logger
   * @description
   * Logger
   */
  @Inject(Logger)
  logger: Logger;

  /**
   * @param {Request} request
   * @description
   * ControllerResolver reflection
   */
  @Inject(Request)
  request: Request;

  /**
   * @param {InMemoryCache} cacheProvider
   * @description
   * InMemoryCache
   */
  @Inject(InMemoryCache)
  cacheProvider: InMemoryCache;

  /**
   * @function
   * @name Cache#before
   *
   * @description
   * Before each controller
   */
  before(data: string): string|Buffer|Promise<string|Buffer> {
    if (this.cacheProvider.has(this.request.getRoute())) {
      this.request.stopChain();
      return this.cacheProvider.get(this.request.getRoute());
    }
    return "Before cache controller filter <-" + data;
  }
  /**
   * @function
   * @name Cache#before
   *
   * @description
   * Before each controller apply this filter
   */
  after(data: string): string|Buffer|Promise<string|Buffer> {
    this.cacheProvider.set(this.request.getRoute(), data, 10); // 10 seconds cache
    this.logger.warn("TRIGGER CACHE", data);
    return data;
  }

}
