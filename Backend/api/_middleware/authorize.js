const expressJwt = require('express-jwt');
const { secret } = require('../config/config');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.Dispatcher or 'Dispatcher')
    // or an array of roles (e.g. [Role.Admin, Role.Dispatcher] or ['Admin', 'Dispatcher'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        expressJwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req, res, next) => {
            // get the current user
            const user = await db.User.findById(req.user.id);
            // find the refresh tokens for this user
            const refreshTokens = await db.RefreshToken.find({ user: user.id });

            // if no user found OR the authorized roles for this URL does not include current user's role
            if (!user || (roles.length && !roles.includes(user.role))) {
                // user no longer exists or role not authorized
                console.log('authorize.authorize: user not found or does not have appropriate role.');
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Check if the user is trying to access verification URLs (e.g., '/api/verification')
            const isVerificationUrl = req.originalUrl.startsWith('/verification');
            console.log(isVerificationUrl, req.originalUrl)
            // If the user is not phone-verified, allow access only to verification URLs
            if (!user.isPhoneVerified && !isVerificationUrl) {
                console.log('authorize.authorize: user phone not verified and attempting to access a protected route.');
                return res.status(401).json({ message: 'Phone verification required' });
            }

            // authentication and authorization successful
            req.user.role = user.role;
            req.user.university = user.university;
            req.user.email = user.email;
            req.user.firstName = user.firstName;
            req.user.lastName = user.lastName;
            req.user.ownsToken = (token) => !!refreshTokens.find((x) => x.token === token);
            next();
        }
    ];
}
