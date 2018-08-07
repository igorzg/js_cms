import * as $ from "jquery";
/**
 * Created by igi on 10/12/14.
 */

let Navigation = {
    init: function () {
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
    }
};


Navigation.init();


let Carousel = {
    /**
     * Initialize
     */
    init: function () {
        this.$element = $('[data-carousel]');
        this.$elementSlides = this.$element.find('[data-slides]');
        this.$wrapper = this.$element.find('.wrapper');
        this.$slideContainer = this.$element.find('[data-slides]');
        this.$slideEelements = this.$slideContainer.children();
        this.$left = this.$element.find('.arrow.left');
        this.$right = this.$element.find('.arrow.right');

        if (this.$slideEelements.length < 2) {
            this.$left.hide();
            this.$right.hide();
            return;
        }

        this.$slideEelements.each(function (index) {
            $(this).attr('data-index', index);
        });

        this.count = this.$slideEelements.length;
        this.$left.bind('click', this.left.bind(this));
        this.$right.bind('click', this.right.bind(this));

        this.$element.bind('swipeLeft', this.right.bind(this));
        this.$element.bind('swipeRight', this.left.bind(this));

        this.width = this.$wrapper.width();
        this.originalWidth = this.width;
        this.maxWidth = this.width * this.count;

        this.$slideEelements.first().before(this.$slideEelements.last());
        this.$slideEelements = this.$slideContainer.children();
        this.$slideContainer.css('margin-left', this.width * -1);

        $(window).bind('resize', this.resize.bind(this));
        this.resize();
    },
    /**
     * Set position of slide
     * @param left
     */
    setPosition: function (left) {
        // refresh
        this.$slideEelements = this.$slideContainer.children();

        if (left) {
            this.index += 1;
        } else {
            this.index -= 1;
        }
        // reset index
        if (this.index < 0) {
            this.index = this.count - 1;
        } else if (this.index >= this.count) {
            this.index = 0;
        }

        if (left) {
            this.$slideEelements.first().before(this.$slideEelements.last().clone());

        } else {
            this.$slideEelements.last().after(this.$slideEelements.first().clone());
        }
    },
    /**
     * Left click
     */
    left: function () {
        if (this.animating) {
            return false;
        }
        this.setPosition(true);
        this.animate(true);
    },
    /**
     * Right click
     */
    right: function () {
        if (this.animating) {
            return false;
        }
        this.setPosition();
        this.animate();
    },
    /**
     * Animate
     */
    animate: function (left) {

        this.animating = true;

        if (left) {
            this.$slideContainer.css('margin-left', (this.width * -2) + 'px');
        }

        this.$slideContainer.animate({
            marginLeft: left ? (this.width  * -1) : (this.width  * -2),
            translate: '0, 0, 0'
        }, {
            duration: 500,
            easing: 'ease-out',
            complete: function () {
                if (left) {
                    this.$slideEelements.last().remove();
                } else {
                    this.$slideEelements.first().remove();
                }
                this.$slideContainer.css('margin-left', this.width * -1);
                this.animating = false;
            }.bind(this)
        });
    },
    /**
     * Resize event
     */
    resize: function () {
        this.width = this.$wrapper.width();
        if (this.width < this.originalWidth) {
            $('li',this.$elementSlides).css('width', this.width);
            this.$slideContainer.css('margin-left', this.width * -1);
        }else {
            $('li',this.$elementSlides).css('width', this.width);
            this.$slideContainer.css('margin-left', this.width * -1);
        }

    }
};

Carousel.init();