/**
 * Jquery init
 */
(function($) {
    "use strict";
    $(function () {
        $('textarea').tinymce({
            script_url : '/vendor/tinymce/tinymce.min.js',
            keep_styles: true,
            plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table contextmenu paste"
            ],
            toolbar: "insertfile undo redo code | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
        });
    });
}(jQuery));