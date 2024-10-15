const config = require('../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');
const moment = require('moment');

module.exports = {
    authenticate,
    _authenticateAndGenerate,
    register,
    forgotPassword,
    getAll,
    revokeToken
};

async function authenticate({ email, password, ipAddress }) {
    console.log('entered UserService.authenticate');
    const user = await db.User.findOne({ email, active: true });

    console.log(`UserService.authenticate user: ${user?.email}`);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {

        console.log(`UserService.authenticate incorrect creds`);
        throw 'Email or password is incorrect';
    }

    console.log(`UserService.authenticate generate token`);
    // set login date
    user.lastLogin = moment().toISOString(); // deprecate
    if (!user.tracking) {
        user.tracking = {};
    }
    await user.save();

   return _authenticateAndGenerate(user, ipAddress);
}

async function register(params, ipAddress, loggedInUser) {
    console.log('entered UserService.register');
    // validate
    if (await db.User.findOne({ email: params.email })) {
        console.log("User with given email address already there in the system.")
        throw 'User with given email address already there in the system.';
    }

    // create user object
    const user = new db.User(params);

    // first registered user is an admin
    const isFirstUser = (await db.User.countDocuments({})) === 0;
    if (isFirstUser) {
        user.role = Role.SuperAdmin;
    }

    if (!user.role) {
        user.role = params.role;
    }

    // hash password
    if (params.password) {
        user.passwordHash = hash(params.password);
    }

    // save user
    await user.save();

    return _authenticateAndGenerate(user, ipAddress);
}


async function forgotPassword({ email }, origin) {
    console.log('entered UserService.forgotPassword');
    const user = await db.User.findOne({ email });

    // always return ok response to prevent email enumeration
    if (!user) return;

    // create reset token that expires after 24 hours
    user.resetToken = {
        token: generateRandomSixDigitCode(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    await user.save();

    // send email
}

async function getAll(user, params) {
    console.log(`UserService.getAll entered ${JSON.stringify(params)}`);
    let users = [];
    users = await db.User.find();
    return users.map((x) => basicDetails(x));
}

async function revokeToken({ token, ipAddress }) {
    console.log('entered UserService.revokeToken');
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getRefreshToken(token) {
    console.log('entered UserService.getRefreshToken');
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

// Function to handle authentication and return tokens
async function _authenticateAndGenerate(user, ipAddress) {
    // Generate tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);

    console.log(`UserService.authenticate save token`);
    // Save refresh token
    await refreshToken.save();

    // Return the tokens and user details
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}


// helper functions

async function getUser(id) {
    console.log('entered UserService.getUser');
    if (!db.isValidId(id)) throw 'User not found';
    const user = await db.User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

function hash(password) {
    console.log('entered UserService.hash');
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(user) {
    console.log('entered UserService.generateJwtToken');
    let expires = '7d';
    return jwt.sign({ username: user.email, sub: user.id, id: user.id }, config.secret, { expiresIn: expires });
}

function generateRefreshToken(user, ipAddress) {
    console.log('entered UserService.generateRefreshToken');
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    console.log('entered UserService.randomTokenString');
    return crypto.randomBytes(40).toString('hex');
}

function generateRandomSixDigitCode() {
    console.log('entered UserService.generateRandomSixDigitCode');
    return Math.floor(100000 + Math.random() * 900000);
}

function basicDetails(user) {
    console.log('UserService.basicDetails entered');
    const {
        id,
        title,
        firstName,
        lastName,
        email,
        tracking,
        role,
        created,
        updated,
        isPhoneVerified = false,
        phoneNumber,
        lastLogin,
        phones,
        active
    } = user;
    return {
        id,
        title,
        firstName,
        lastName,
        email,
        tracking,
        role,
        created,
        updated,
        isPhoneVerified,
        phoneNumber,
        lastLogin,
        phones,
        active
    };
}