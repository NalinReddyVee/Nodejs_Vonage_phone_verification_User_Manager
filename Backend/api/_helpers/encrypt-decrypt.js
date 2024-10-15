const { secret } = require('../config/config');
const crypto = require('crypto-js');

function encryptSecretKey(secretKey) {
    const encrypted = crypto.AES.encrypt(secretKey, secret).toString();
    return encrypted;
}

function decryptSecretKey(encryptedSecretKey) {
    const decrypted = crypto.AES.decrypt(encryptedSecretKey, secret).toString(crypto.enc.Utf8);
    return decrypted;
}

module.exports = { encryptSecretKey, decryptSecretKey }