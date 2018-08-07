import * as $ from "jquery";

/**
 * init
 */
class Carousel {

    element: JQuery<HTMLElement>;
    elementSlides: JQuery<HTMLElement>;
    wrapper: JQuery<HTMLElement>;
    slideContainer: JQuery<HTMLElement>;
    slideElements: JQuery<HTMLElement>;
    leftElement: JQuery<HTMLElement>;

    rightElement: JQuery<HTMLElement>;
    count: number;
    width: number;
    originalWidth: number;
    maxWidth: number;
    animating: boolean;
    index: number;

    /**
     * Initialize Carousel
     * @param {string} selector
     */
    constructor(selector: string = "[data-carousel") {
        this.element = $(selector);
        this.elementSlides = this.element.find('[data-slides]');
        this.wrapper = this.element.find('.wrapper');
        this.slideContainer = this.element.find('[data-slides]');
        this.slideElements = this.slideContainer.children();
        this.leftElement = this.element.find('.arrow.left');
        this.rightElement = this.element.find('.arrow.right');

        if (this.slideElements.length < 2) {
            this.leftElement.hide();
            this.rightElement.hide();
            return;
        }

        this.slideElements.each(function (index) {
            $(this).attr('data-index', index);
        });

        this.count = this.slideElements.length;
        this.leftElement.on('click', this.left.bind(this));
        this.rightElement.on('click', this.right.bind(this));

        this.element.on('swipeLeft', this.right.bind(this));
        this.element.on('swipeRight', this.left.bind(this));

        this.width = this.wrapper.width();
        this.originalWidth = this.width;
        this.maxWidth = this.width * this.count;

        this.slideElements.first().before(this.slideElements.last());
        this.slideElements = this.slideContainer.children();
        this.slideContainer.css('margin-left', this.width * -1);

        $(window).on('resize', this.resize.bind(this));
        this.resize();
    }

    /**
     * Set position
     * @param {boolean} left
     */
    private setPosition(left: boolean) {
        // refresh
        this.slideElements = this.slideContainer.children();

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
            this.slideElements.first().before(this.slideElements.last().clone());
        } else {
            this.slideElements.last().after(this.slideElements.first().clone());
        }
    }


    /**
     * Animate in left direction
     * @returns {boolean}
     */
    private left() {
        if (this.animating) {
            return false;
        }
        this.setPosition(true);
        this.animate(true);
    }


    /**
     * Animate in right direction
     * @returns {boolean}
     */
    private right() {
        if (this.animating) {
            return false;
        }
        this.setPosition(false);
        this.animate(false);
    }


    /**
     * Animate slide
     * @param {boolean} left
     */
    private animate(left: boolean) {

        this.animating = true;

        if (left) {
            this.slideContainer.css('margin-left', (this.width * -2) + 'px');
        }

        this.slideContainer.animate({
            marginLeft: left ? (this.width * -1) : (this.width * -2),
            translate: '0, 0, 0'
        }, {
            duration: 500,
            easing: 'ease-out',
            complete: () => {
                if (left) {
                    this.slideElements.last().remove();
                } else {
                    this.slideElements.first().remove();
                }
                this.slideContainer.css('margin-left', this.width * -1);
                this.animating = false;
            }
        });
    }

    /**
     * Resize slide
     */
    private resize() {
        this.width = this.wrapper.width();
        if (this.width < this.originalWidth) {
            $('li', this.elementSlides).css('width', this.width);
            this.slideContainer.css('margin-left', this.width * -1);
        } else {
            $('li', this.elementSlides).css('width', this.width);
            this.slideContainer.css('margin-left', this.width * -1);
        }

    }
}

export function init(selector: string = "[data-carousel"): Carousel {
    return new Carousel(selector);
}