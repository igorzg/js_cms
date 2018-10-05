import {Application} from "./application";
import {httpServer, isUndefined} from "@typeix/rexxar";

// SET template path if not defined
if (isUndefined(process.env.TEMPLATE_PATH)) {
  process.env.TEMPLATE_PATH = "/build/";
}
// SET assets path if not defined
if (isUndefined(process.env.ASSETS_PATH)) {
  process.env.ASSETS_PATH = "/build/public/";
}
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
