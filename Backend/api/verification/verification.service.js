const db = require('../_helpers/db');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../_helpers/vonage');
const userService = require('../users/user.service');

module.exports = {
    requestVerification,
    verifyCode
}

async function requestVerification(loggedInUser) {
    const code = generateCode();
    const codeExpiry = new Date(Date.now() + 2 * 60 * 1000); // Code expires in 2 minutes
        let user = await db.User.findOne({ _id: loggedInUser.id });
        if (user.isPhoneVerified) throw "User phone number verified already!";
        if (!user || !user.phoneNumber) {
            throw "Something went wrong please try again later";
        } else {
            user.verificationCode = code;
            user.codeExpiry = codeExpiry;
        }
        await user.save();
        const normalizedPhoneNumber = user.countryCode + user.phoneNumber;

        const { success, error } = await sendVerificationCode(normalizedPhoneNumber, code);
        if (!success) {
            throw error;
        }

        return { message: 'Verification code sent successfully' };
}

async function verifyCode(req) {
    const { verificationCode } = req.body;
    const loggedInUser = req.user;
        const user = await db.User.findOne({ _id: loggedInUser.id });

        if (!user) {
            throw 'User not found';
        }
        console.log(user.verificationCode, verificationCode, +user.verificationCode === verificationCode)
        if (+user.verificationCode === +verificationCode && new Date() < user.codeExpiry) {
            user.isPhoneVerified = true;
            user.verificationCode = null;
            user.codeExpiry = null;
            user.verified = new Date();
            await user.save();

            return userService._authenticateAndGenerate(user, req.ip);
        } else {
            throw 'Invalid or expired verification code';
        }
}


//Helper function
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
