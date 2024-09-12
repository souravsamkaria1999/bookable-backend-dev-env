const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const { GraphQLJSON } = require("graphql-type-json");
const realEstateTypeDefs = require("../modules/real-estate/realEstateTypeDef");
const inspectionTypeDefs = require("../modules/inspection/inspectionTypeDefs");
const reraDataTypeDefs = require("../modules/rera-data/reraDataTypeDefs");
const eventTypeDefs = require("../modules/events/eventTypeDefs");
const paymentTypeDefs = require("../modules/payment/paymentTypeDefs");
const typeDefs = [realEstateTypeDefs, inspectionTypeDefs, reraDataTypeDefs, eventTypeDefs, paymentTypeDefs];
const inspectionResolverFunc = require("../modules/inspection/resolver_funciton/resolver");
const realEstateResolverFunc = require("../modules/real-estate/resolver_function/realEstateResolver");
const reraDataResolverFunc = require("../modules/rera-data/resolver_function/rera-data-resolver-function");
const events = require("../modules/events/resolver_function/resolver");
const payment = require("../modules/payment/resolver_function/payment-resolver");
const resolvers = {
  Query: {
    //real_Estate
    // getUserByRole: realEstateResolverFunc.getUserByRole,
    // getPropertyCategories: realEstateResolverFunc.getPropertyCategories,
    // getPropertyType: realEstateResolverFunc.getPropertyTypes,
    // getPropertyAmenities: realEstateResolverFunc.getPropertyAmenities,
    // getPropertyBhkType: realEstateResolverFunc.getPropertyBhkType,
    // getPropertyListingType: realEstateResolverFunc.getPropertyListingType,
    // getPropertyFurnishingType: realEstateResolverFunc.getPropertyFurnishingType,
    // getPropertyMaintenanceType: realEstateResolverFunc.getPropertyMaintenanceType,

    //rera 
    getStateWiseData: reraDataResolverFunc.getStateWiseData,
    getAgentBy_name_and_certificateNumber: reraDataResolverFunc.getAgentByNameAndReraNum,
    
    //inspection
    // deleteAgent: reraDataResolverFunc.deleteAgentById,
    // getInspectionTimings: inspectionResolverFunc.getInspections,
    // deleteSlot: inspectionResolverFunc.deleteSlot,
    // getVisitingUsers: inspectionResolverFunc.getVisitingUsers,

    //events
    event_getEventById: events.getEventById,
    event_getEventByUserId: events.getEventByUserId,
    event_getAllEvent: events.getAllEvent,
    event_getBookingCustomersList :events.getCustomersListByEventId,
    event_countEventBookingCustomer:events.countEventBookingCustomer,
    event_getCustomerTicketDetails : events.getCustomerTicketDetails,
    iframe_getEventByid: events.iframe_getEventById,

    //stripe for event
    stripe_getUserStripeInfo: events.stripe_getUserStripeInfo,

    // Subscription_Available
    sub_getAllSubscription_Available:events.getAllSubscription_Available,
    sub_getSubscriptionSubscribedList:events.getSubscriptionSubscribeList,
  },
  Mutation: {
    //real_Estate
    registerRealEstateUser: realEstateResolverFunc.register,
    loginRealEstateUser: realEstateResolverFunc.login,
    addProperty: realEstateResolverFunc.createProperty,

    //rera
    createStateWiseData: reraDataResolverFunc.createData,
    updateAgentStateWise: reraDataResolverFunc.editAgentStateWise,

    // inspection
    userRegistration: inspectionResolverFunc.registerUser,
    userLogin: inspectionResolverFunc.userLogin,
    updateEmailValidation: inspectionResolverFunc.updateEmailValidation,
    // createInspectionTimings: inspectionResolverFunc.createInspection,
    // addSlot: inspectionResolverFunc.addSlot,
    // bookInspection: inspectionResolverFunc.bookInspection,
    // banClients: inspectionResolverFunc.banClients,
    Ins_sendOTPEmail : inspectionResolverFunc.sendOTPEmail,
    Ins_verifyEmailOTP : inspectionResolverFunc.verifyEmailOTP,

    // event
    event_createEvent: events.createEvent,
    event_deleteEvent: events.deleteEventById,
    event_uploadImageUrl: events.uploadImageUrl,
    event_updateEventPublishStatus: events.change_EventPublish_Status,
    event_buyNow : events.buyNow,
    event_freeEventBuyNow : events.freeEventbuyNow,
    event_updateCustomerPaymentStatus : events.updateCustomerPaymentStatus,
    event_updateCustomerPaymentStatusForFreeEvent: events.updateCustomerPaymentStatusForFreeEvent,
    event_updateCustomerAttendence : events.updateCustomerPresence,
    event_PaymentLink : events.eventPayment,
    event_resendTicketDetails : events.emailByEventOwner,
  
    contactUs:events.contactUs,
    auth_ChangePassword : events.changePassword,
    auth_ForgetPassword : events.forgetPassword,
    auth_changeForgetPassword : events.changeForgetPassword,

    // stripe for event
    stripe_CreateProduct : events.stripe_createProduct,
    stripe_CreatePrice : events.stripe_createPrice,
    stripe_userStripeInfo : events.stripe_userStripeInfo,

    // create Subscription_Available
    sub_createSubscription_Available : events.createSubscription_Available,
    sub_updateSubscription_Available : events.updateSubscription_Available,
    sub_deleteSubscription_Available : events.deletSubscription_Available,

    // payment
    payment_getPublishKey : payment.getpublishkey,
    payment_setupIntent : payment.setupIntent,
    payment_retrieveSetupIntentAndCreateSubscription : payment.retrieveSetupIntentAndCreateSubscription,
    payment_CreateCustomer : payment.stripe_createCustomer,
    payment_cancelSubscription : payment.cancelSubscription,
  },

  Bigint: new GraphQLScalarType({
    name: "BigInt",
    description: "Custom scalar type representing BigInt",

    serialize(value) {
      return value.toString();
    },

    parseValue(value) {
      return BigInt(value);
    },

    parseLiteral(ast) {
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
        return BigInt(ast.value);
      }
      return null;
    },
  }),

  MonthDay: new GraphQLScalarType({
    name: "MonthDay",
    description: "Custom scalar type representing/checking MonthDay",
  
    serialize(value) {
      // Ensure the value is serialized as a number
      if (!Number.isInteger(value) || value < 1 || value > 31) {
        throw new Error('MonthDay must be an integer between 1 and 31.');
      }
      return value;
    },
  
    parseValue(value) {
      // Ensure the value is a valid integer between 1 and 31
      if (!Number.isInteger(value) || value < 1 || value > 31) {
        throw new Error('MonthDay must be an integer between 1 and 31.');
      }
      return value;
    },
  
    parseLiteral(ast) {
      // Parse the AST literal
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
        const intValue = parseInt(ast.value, 10);
        if (!Number.isInteger(intValue) || intValue < 1 || intValue > 31) {
          throw new Error('MonthDay must be an integer between 1 and 31.');
        }
        return intValue;
      }
      return null;
    },
  }),
  

  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return ast.value;
      }
      return null;
    },
  }),
  JSON: GraphQLJSON,
};

module.exports = { typeDefs, resolvers };
