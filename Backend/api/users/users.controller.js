const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const rateLimit = require("express-rate-limit");

const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const userService = require('./user.service');
const config = require('../config/config');

// Limit Api call rates to 10 per minute
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: config.maxApiRateLimit,
  });


// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/forgot-password', limiter, forgotPasswordSchema, forgotPassword);
router.get('/', authorize(), getAll);
router.post('/revoke-token', authorize(), revokeToken);




module.exports = router;

function authenticateSchema(req, res, next) {
    console.log(`entered UsersController.authenticateSchema`);
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    console.log(`entered UsersController.authenticate`);
    console.log(`req body email ${req.body.email}`);
    const { email, password } = req.body;
    const ipAddress = req.ip;
    userService
        .authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            console.log(`finished authen user`);
            res.json(user);
        })
        .catch((err) => {
            console.log(`error authenticating user: ${err}`);
            next(err);
        });
}

function registerSchema(req, res, next) {
    console.log(`UsersController.registerSchema entered`);
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        countryCode: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        acceptTerms: Joi.boolean().valid(true).required(),
        role: Joi.string()
            .empty('')
            .required(),
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    console.log(`entered UsersController.register`);
    console.log(`UsersController.register origin: ${req.get('origin')}`);
    console.log(`UsersController.register req.body: ${JSON.stringify(req.body)}`);
    userService
        .register(req.body, req.ip, req.user || {})
        .then((response) => {
            res.json(response);
        })
        .catch(next);
}

function forgotPasswordSchema(req, res, next) {
    console.log(`entered UsersController.forgotPasswordSchema`);
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    console.log(`entered UsersController.forgotPassword`);
    userService
        .forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function getAll(req, res, next) {
    console.log(`UsersController.getAll entered`);
    userService
        .getAll(req.user, req.query)
        .then((users) => {
            return res.json(users);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    console.log(`entered UsersController.revokeTokenSchema`);
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    console.log(`entered UsersController.revokeToken`);
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && !utils.isAdministrator(req.user.role)) {
        console.log('DEBUG: unauthorized 3');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService
        .revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}


// helper functions

function setTokenCookie(res, token) {
    console.log(`entered UsersController.setTokenCookie`);
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sameSite: 'none',
        secure: true
    };
    res.cookie('refreshToken', token, cookieOptions);
    console.log(`exiting UsersController.setTokenCookie`);
}
