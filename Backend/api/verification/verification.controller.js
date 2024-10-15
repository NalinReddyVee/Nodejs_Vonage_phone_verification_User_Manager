const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const rateLimit = require("express-rate-limit");

const validateRequest = require('../_middleware/validate-request');
const verificationService = require('./verification.service');
const config = require('../config/config');
const authorize = require('../_middleware/authorize');


// Limit Api call rates to 10 per minute
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: config.maxApiRateLimit,
  });

// Should modify authorize method to allow all verification controller api endpoints even if user is not verified. (If throws 401 only however we are not checking the flag)
// routes
router.post('/request',  authorize(), limiter, requestVerification);
router.post('/verify-code', authorize(), limiter, verifyCodeSchema, verifyCode);


module.exports = router;

async function requestVerification(req, res, next) {
    console.log(`entered VerificationController.requestVerification`);
    try {
        const verificationRes = await verificationService.requestVerification(req.user);
        console.log(`Sent phone number verification`);
        res.json(verificationRes);
    } catch(err) {
        console.log(`error sending verification code to user's phone number: ${err}`);
        res.status(500).json({message: err});
    }
}

function verifyCodeSchema(req, res, next) {
    console.log(`entered VerificationController.verifyCodeSchema`);
    const schema = Joi.object({
        verificationCode: Joi.number().required(),
    });
    validateRequest(req, next, schema);
}

async function verifyCode(req, res, next) {
    console.log(`entered VerificationController.verifyCode`);
    try {
        const verificationRes = await verificationService.verifyCode(req)
        console.log(`User phone number verification success!`);
        res.json(verificationRes);
    } catch(err) {
        console.log(`error verifying the user's phone number: ${err}`);
        res.status(500).json({message: err});
    }
    
}
