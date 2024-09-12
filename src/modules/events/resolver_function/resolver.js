const eventService = require('../services/eventService');
const sharedMethod = require('../../../sharedMethod/sharedMethod');
const config = require("config");

exports.createEvent = async(_, args,context)=>{
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const event = await eventService.createEvent({args,context});
        return event;
    } catch (error) {
        throw new Error(error);
      }
}

exports.getEventById = async(_, args,context)=>{
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const event = await eventService.getEventById({args,context});
        return event ;
    } catch (error) {
        throw new Error(error);
      }
}

exports.getEventByUserId = async(_, args,context)=>{
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const userEvents = await eventService.getEventByUserId({args,context});
        return userEvents;
    } catch (error) {
        throw new Error(error);
      }
}

exports.getAllEvent = async(_, args,context)=>{
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const userEvents = await eventService.getAllEvent({args,context});
        return userEvents;
    } catch (error) {
        throw new Error(error);
      }
}

exports.updateEventById = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const updatevent = await eventService.updateEventById({args});
        return updatevent;
    } catch (error) {
        throw new Error(error);
      }
}


exports.countEventBookingCustomer = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const customersCount = await eventService.countEventBookingCustomer({args});
        return customersCount;
    } catch (error) {
        throw new Error(error);
      }
}

exports.deleteEventById = async (_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const deletevent = await eventService.deleteEventsById({args});
        return deletevent;
    } catch (error) {
        throw new Error(error);
      }
}

exports.uploadImageUrl = async (_,args,context) => {
    try{
        const token = context.token;
        const urlUpload = await eventService.uploadImageUrl({args,token});
        return urlUpload;
    } catch (error) {
        throw new Error(error);
      }
}

exports.change_EventPublish_Status = async (_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const publishStatus = await eventService.updateEventPublishStatus({args});
        return publishStatus;
    } catch (error) {
        throw new Error(error);
      }
}

exports.buyNow = async (_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const buyerDetail = await eventService.buyNow({args});
        return buyerDetail;
    } catch (error) {
        throw new Error(error);
      }
}

exports.freeEventbuyNow = async (_,args,context) => {
  try{
      const token = context.token;
      if (token !== config.get("ACCESS_TOKEN")) {
          const verifyToken = await sharedMethod.tokenVerification(token)
          if (verifyToken.valid === false) {
            return new Error(verifyToken.error);
          }
        }
      const buyerDetail = await eventService.freeEvent_buyNow({args});
      return buyerDetail;
  } catch (error) {
      throw new Error(error);
    }
}
exports.updateCustomerPaymentStatus = async (_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const UpdatePaymentStatus = await eventService.updateCustomerPaymentStatus({args,context});
        return UpdatePaymentStatus;
    } catch (error) {
        throw new Error(error);
      }
}

exports.updateCustomerPaymentStatusForFreeEvent = async (_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const UpdatePaymentStatus = await eventService.updateCustomerPaymentStatusForFreeEvent({args,context});
        return UpdatePaymentStatus;
    } catch (error) {
        throw new Error(error);
      }
}

exports.updateCustomerPresence = async (_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const UpdatePaymentStatus = await eventService.updateCustomerPresence({args});
        return UpdatePaymentStatus;
    } catch (error) {
        throw new Error(error);
      }
}

exports.getCustomerTicketDetails = async(_,args,context) => {
  try{
      const token = context.token;
      if (token !== config.get("ACCESS_TOKEN")) {
          const verifyToken = await sharedMethod.tokenVerification(token)
          if (verifyToken.valid === false) {
            return new Error(verifyToken.error);
          }
        }
      const ticketDetails = await eventService.getCustomerTicketDetails({args});
      return ticketDetails[0];
  } catch (error) {
      throw new Error(error);
  }
}

exports.getCustomersListByEventId = async(_, args,context)=>{
try{
  const token = context.token;
  if (token !== config.get("ACCESS_TOKEN")) {
      const verifyToken = await sharedMethod.tokenVerification(token)
      if (verifyToken.valid === false) {
        return new Error(verifyToken.error);
      }
    }
    const customersList = await eventService.getCustomersListByEventId({args});
    
    return customersList;
} catch (error) {
    throw new Error(error);
  }
}

exports.eventPayment = async (_,args) => {
    try{
        const payment = await eventService.stripePaymentLink({args});
        return payment;
    } catch (error) {
        throw new Error(error);
      }
}


// for iframe
exports.iframe_getEventById = async(_, args,context)=>{
    try{
        const event = await eventService.iframe_EventById({args,context});
        return event ;
    } catch (error) {
        throw new Error(error);
      }
}

exports.contactUs = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
          const verifyToken = await sharedMethod.tokenVerification(token)
          if (verifyToken.valid === false) {
            return new Error(verifyToken.error);
          }
        }
        const plan_choosen = await eventService.contactUs({args});
        return plan_choosen;
    } catch (error) {
        throw new Error(error);
    }
}

exports.stripe_createProduct = async(_,args,context) => {
    try{
      const token = context.token;
      if (token !== config.get("ACCESS_TOKEN")) {
        const verifyToken = await sharedMethod.tokenVerification(token)
        if (verifyToken.valid === false) {
          return new Error(verifyToken.error);
        }
      }
        const product = await eventService.stripe_createProduct({args});
        return product;
    } catch (error) {
        throw new Error(error);
    }
}

exports.stripe_createPrice = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
          const verifyToken = await sharedMethod.tokenVerification(token)
          if (verifyToken.valid === false) {
            return new Error(verifyToken.error);
          }
        }
        const product = await eventService.stripe_createPrice({args});
        return product;
    } catch (error) {
        throw new Error(error);
    }
}

exports.stripe_userStripeInfo = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const stripeInfoId = await eventService.stripe_userStripeInfo({args});
        return stripeInfoId;
    } catch (error) {
        throw new Error(error);
    }
}

exports.stripe_getUserStripeInfo = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const stripeInfoId = await eventService.stripe_getUserStripeInfo({args});
        return stripeInfoId;
    } catch (error) {
        throw new Error(error);
    }
}

exports.createSubscription_Available = async(_,args) => {
    try{
        const subscription = await eventService.createSubscription_Available({args});
        return subscription;
    } catch (error) {
        throw new Error(error);
    }
}

exports.updateSubscription_Available = async(_,args) => {
    try{
        const updateSubscription = await eventService.updateSubscription_Available({args});
        return updateSubscription;
    } catch (error) {
        throw new Error(error);
    }
}

exports.deletSubscription_Available = async(_,args) => {
    try{
        const deleteSubscription = await eventService.deletSubscription_Available({args});
        return deleteSubscription;
    } catch (error) {
        throw new Error(error);
    }
}

exports.getAllSubscription_Available = async(_,args) => {
    try{
        const deleteSubscription = await eventService.getAllSubscription_Available({args});
        return deleteSubscription;
    } catch (error) {
        throw new Error(error);
    }
}

exports.emailByEventOwner = async(_,args,context) => {
    try{
        // const token = context.token;
        // if (token !== config.get("ACCESS_TOKEN")) {
        //     const verifyToken = await sharedMethod.tokenVerification(token)
        //     if (verifyToken.valid === false) {
        //       return new Error(verifyToken.error);
        //     }
        //   }
        const sendEmail = await sharedMethod.toSendTicketDetailsEmailByEventOwner({args,context});
        return sendEmail;
    } catch (error) {
        throw new Error(error);
    }
}

exports.changePassword = async(_,args,context) => {
    try{
        const token = context.token;
        const verifyToken = await sharedMethod.tokenVerification(token)
        if (verifyToken.valid === false) {
          return new Error(verifyToken.error);
        }
        const newPassword = await eventService.changePassword({args});
        return newPassword;
    } catch (error) {
        throw new Error(error);
    }
}

exports.forgetPassword = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const forgetPass = await eventService.forgetPassword({args,context});
        return forgetPass;
    } catch (error) {
        throw new Error(error);
    }
}

exports.changeForgetPassword = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const newPassword = await eventService.changeForgetPassword({args});
        return newPassword;
    } catch (error) {
        throw new Error(error);
    }
}

exports.getSubscriptionSubscribeList = async(_,args,context) => {
    try{
        const token = context.token;
        if (token !== config.get("ACCESS_TOKEN")) {
            const verifyToken = await sharedMethod.tokenVerification(token)
            if (verifyToken.valid === false) {
              return new Error(verifyToken.error);
            }
          }
        const newPassword = await eventService.subscriptionSubscribeList({args});
        return newPassword;
    } catch (error) {
        throw new Error(error);
    }
}