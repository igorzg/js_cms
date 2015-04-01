'use strict';
var di = require('mvcjs'),
    Canvas = di.load('canvas'),
    Promise = di.load('promise'),
    Type = di.load('typejs'),
    error = di.load('error'),
    nodemailer = di.load('nodemailer'),
    ViewController = di.load('@{controllersPath}/private/view'),

    component = di.load('core/component'),
// components
    config = component.get('params'),
    ContactController;

ContactController = ViewController.inherit({}, {


    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ContactController#beforeEach
     *
     * @description
     * Execute before each action
     * @return {*}
     */
    beforeEach: function ContactController_beforeEach(action, params) {
        var html = this.getCache(this.getRequestUrl());
        if (!!html && action !== 'captcha') {
            this.stopChain();
            return html;
        }
        return this._super(action, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ContactController#captcha
     *
     * @description
     * Display captcha
     * @return {*}
     */

    action_captcha: function ContactController_captcha() {
        var canvas = new Canvas(250, 150), ctx, i, text, params = {};
        // set png
        this.addHeader('Content-Type', 'image/png');

        params.color = 'rgb(0,100,100)';
        params.background = 'rgb(200,200,150)';

        ctx = canvas.getContext('2d');
        ctx.antialias = 'gray';
        ctx.fillStyle = params.background;
        ctx.fillRect(0, 0, 250, 150);
        ctx.fillStyle = params.color;
        ctx.lineWidth = 8;
        ctx.strokeStyle = params.color;
        ctx.font = '60px sans';

        text = ('' + Math.random()).substr(3, 6);

        ctx.moveTo(10, 75);
        ctx.lineTo(240, 75);
        ctx.stroke();

        for (i = 0; i < text.length; i++) {
            ctx.setTransform(Math.random() * 0.5 + 1, Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.5 + 1, 30 * i + 20, 100);
            ctx.fillText(text.charAt(i), 0, 0);
        }

        this.setSession('contact_captcha', text);

        return new Promise(function (response, reject) {
            canvas.toBuffer(function (err, buf) {
                if (!!err) {
                    return reject(err);
                }
                response(buf);
            });
        });
    },
    /**
     * @since 0.0.1
     * @author  Igor Ivanovic
     * @method Before#index
     *
     * @description
     * Render index
     * @return {*|string}
     */
    before_index: function ContactController_beforeindex(params) {
        var body,
            captcha = this.getSession('contact_captcha'),
            smtpTransport,
            mailOptions,
            errors = {},
            errorMessages = {},
            postData = {};

        // Attempt to send email
        if (this.getMethod() === 'POST') {
            body = this.getParsedBody();

            if (!body.name) {
                errors.name = true;
                errorMessages.name = this.translate('You must enter your name');
            }

            if (!body.email.match(/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/)) {
                errors.email = true;
                errorMessages.email = this.translate('Please provide correct email!');
            }

            if (!body.subject) {
                errors.subject = true;
                errorMessages.subject = this.translate('Please provide subject!');
            }

            if (!body.message) {
                errors.message = true;
                errorMessages.message = this.translate('Please provide message!');
            }

            if (!body.captcha) {
                errors.captcha = true;
                errorMessages.captcha = this.translate('Please provide captcha!');
            } else if (captcha !== body.captcha) {
                errors.captcha = true;
                errorMessages.captcha = this.translate('Please enter correct number from picture!');
            }


            postData = {
                name: body.name,
                email: body.email,
                subject: body.subject,
                message: body.message
            };

            // If there is no validation error
            if (Object.keys(errors).length === 0) {

                mailOptions = {
                    from: body.email,
                    to: config.get('email_username'),
                    subject: body.subject,
                    html: body.name + ' ' + body.subject + ' ' + body.message
                };


                smtpTransport = nodemailer.createTransport("SMTP", {
                        host: config.get('email_server'),
                        port: 25,
                        auth: {
                            user: config.get('email_username'),
                            pass: config.get('email_password')
                        }
                    }
                );

                //send mail
                return new Promise(function (resolve, reject) {
                    smtpTransport.sendMail(mailOptions, function (e, res) {
                        if (e) {
                            return reject(e);
                        }
                        // Clear post data and errors
                        errors = {};
                        postData = {};
                        errorMessages = {};

                        this.locals.showSuccess = true;

                        return resolve(res);
                    }.bind(this));
                }.bind(this));
            }
        }


        this.locals.errors = errors;
        this.locals.errorMessages = errorMessages;
        this.locals.postData = postData;
    },
    /**
     * @since 0.0.1
     * @author  Igor Ivanovic
     * @method ContactController#index
     *
     * @description
     * Render index
     * @return {*|string}
     */
    action_index: function ContactController_index(params) {


        return this.renderFile('contact/index', this.locals);
    }
});

module.exports = ContactController;