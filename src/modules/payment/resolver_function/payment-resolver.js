const sharedMethod = require('../../../sharedMethod/sharedMethod');
const paymentService = require('../services/paymentService');

exports.getpublishkey = async(_, args)=>{
    try{
        const publishKey = await paymentService.getpublishkey({args});
        return publishKey;
    } catch (error) {
        throw new Error(error);
      }
}

exports.setupIntent = async(_, args,context)=>{
    try{
        const token = context.token;
        const verifyToken = await sharedMethod.tokenVerification(token)
        if (verifyToken.valid === false) {
          return new Error(verifyToken.error);
        }
        const payment = await paymentService.setupIntent({args,token});
        return payment;
    } catch (error) {
        throw new Error(error);
      }
}

exports.retrieveSetupIntentAndCreateSubscription = async(_, args,context)=>{
    try{
        const token = context.token;
        const verifyToken = await sharedMethod.tokenVerification(token)
        if (verifyToken.valid === false) {
          return new Error(verifyToken.error);
        }
        const payment = await paymentService.retrieveSetupIntentAndCreateSubscription({args});
        return payment;
    } catch (error) {
        throw new Error(error);
      }
}

exports.stripe_createCustomer = async(_, args,context)=>{
    try{
        const token = context.token;
        const verifyToken = await sharedMethod.tokenVerification(token)
        if (verifyToken.valid === false) {
          return new Error(verifyToken.error);
        }
        const payment = await paymentService.stripe_createCustomer({args,token});
        return payment;
    } catch (error) {
        throw new Error(error);
      }
}

exports.cancelSubscription = async(_, args,context)=>{
  try{
      const token = context.token;
      const verifyToken = await sharedMethod.tokenVerification(token)
      if (verifyToken.valid === false) {
        return new Error(verifyToken.error);
      }
      const payment = await paymentService.cancelSubscription({args});
      return payment;
  } catch (error) {
      throw new Error(error);
    }
}