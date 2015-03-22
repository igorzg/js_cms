/**
 * Jquery init
 */
(function($) {
    "use strict";
    $(function () {
        $('textarea').tinymce({
            script_url : MV.assetsPath + '/vendor/tinymce/tinymce.min.js'
        });
    });
}(jQuery));