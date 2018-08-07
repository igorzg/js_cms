import {ready} from "jquery";
import {init} from "modules/carousel";

ready.then(() => {
    // init
    init();

    // navigation
    let win = $(window),
        body = $(document.body);
    // open navigation
    $('.mv-navigation-call').on('click', () => {
        body.toggleClass('open');
    });

    win.on('swipeRight', (e) => {
        if ($(e.target).closest('[data-carousel]').length === 0) {
            body.addClass('open');
        }
    });
    // swipe left
    win.on('swipeLeft', (e) => {
        if ($(e.target).closest('[data-carousel]').length === 0) {
            body.removeClass('open');
        }
    });
});