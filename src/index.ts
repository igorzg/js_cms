import {Application} from "./application";
import {httpServer} from "@typeix/rexxar";

/**
 * Bootstraps server
 *
 * @function
 * @name httpServer
 *
 * @description
 * Creates server instance on port 9000
 * We always use separate bootstrap file to bootstrap application because of testing or server side fakeHttp feature.
 * We will be able to simulate server side request with fakeHttp
 */
httpServer(Application, {
  port: 9000
});
