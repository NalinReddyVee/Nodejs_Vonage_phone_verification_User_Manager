const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    title: { type: String, required: true },
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    acceptTerms: Boolean,
    role: { type: String, required: true, index: true },
    verificationCode: String,
    codeExpiry: Date,
    isPhoneVerified: { type: Boolean, required: true, default: false },
    verified: Date,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date,
    lastLogin: { type: String },
    countryCode: { type: String, required: true, default: '+91' },
    phoneNumber: { type: String, required: true, unique: true },
    active: { type: Boolean, required: true, default: true }
});

schema.virtual('isVerified').get(function () {
    return !!(this.verified || this.passwordReset);
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('User', schema);
