const { Vonage } = require('@vonage/server-sdk')
const config = require("../config/config");

const vonage = new Vonage({
  apiKey: config.vonage.apiKey,
  apiSecret: config.vonage.apiSecret
})

module.exports = { sendVerificationCode };


async function sendVerificationCode(phoneNumber, code) {
    try {
        await vonage.sms.send({to: phoneNumber, from: 'Vonage APIs', text: 'Your Mobile verification code: '+code});
        return { success: true };
    } catch (error) {
        console.error('Vonage Error: ', error);
        return { success: false, error: error.message };
    }
}