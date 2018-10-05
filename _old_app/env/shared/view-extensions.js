/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name widget.js
 * @function
 * @description
 * Is used to extend view so we can support widgets
 */
module.exports = function (viewLoader, di) {

    // filter filter
    viewLoader.setFilter('filterScript', function (input, key, value) {
        if (!Array.isArray(input)) {
            return input;
        }
        return input.filter(function(item) {
            return item[key] === value;
        });
    });

    // filter filter
    viewLoader.setFilter('pageNext', function (input, value) {
        return input + '/page/' + (parseInt(value) + 1);
    });

    viewLoader.setFilter('pagePrev', function (input, value) {
        if (parseInt(value) === 2) {
            return input;
        }
        return input + '/page/' + (parseInt(value) - 1);
    });

    viewLoader.setFilter('slice', function (input, a, b) {
        return input.slice(a, b);
    });
};