import {Injector, Router, Request} from "@typeix/rexxar";
import {HomeController} from "./home";
import {Assets} from "../components/assets";
import {TemplateEngine} from "../components/template-engine";


describe("Home controller", () => {

    let controller: HomeController;
    let assetsMock = {};
    let requestMock = {
        redirectTo: () => {}
    };
    let routerMock = {
        createUrl: () => {}
    };
    let templateMock = {};

    beforeAll(() => {
        let injector = Injector.createAndResolve(HomeController, [
            {
                provide: Assets,
                useValue: assetsMock
            },
            {
                provide: Request,
                useValue: requestMock
            },
            {
                provide: Router,
                useValue: routerMock
            },
            {
                provide: TemplateEngine,
                useValue: templateMock
            }
        ]);
        controller = injector.get(HomeController);
    });

    it("Should test redirect action", (done) => {
       let aSpy = jest.spyOn(requestMock, "redirectTo");
       let bSpy = jest.spyOn(routerMock, "createUrl");
       controller.redirect().then(() => {
           expect(aSpy).toHaveBeenCalled();
           expect(bSpy).toHaveBeenCalled();
           done();
       }).catch(done);
    });
});
