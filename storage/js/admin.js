/**
 * Jquery init
 */
(function($) {
    "use strict";
    $(function () {
        $('textarea').tinymce({
            script_url : MV.assetsPath + '/vendor/tinymce/tinymce.min.js',
            plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table contextmenu paste"
            ],
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
        });
    });
}(jQuery));