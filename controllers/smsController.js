const fast2sms = require('fast-two-sms');

const sendMessage = async(phone) => {
  let randomOTP = Math.floor(Math.random()*10000)
  var options = {
    authorization: 'azrKw1DCZtJnY5pOWNfgBjoXGRyiAI3Vk2d08vFSQxcs7hHPLl5dmvEog7SIyfUpwQRTrzXa8xJ9ZH30',
    message: `Your verification code is ${randomOTP}`,
    numbers: [phone]
  };

  try {
    await fast2sms.sendMessage(options);
    return randomOTP;
  }
    catch(error) {
      console.error(error);
      throw new Error('Error sending OTP');
    };
  
};
  
module.exports={
sendMessage:sendMessage

}