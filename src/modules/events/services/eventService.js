const shared = require("../../../sharedMethod/sharedMethod");
const { reraConn } = require("../../../dbconfig");
const ShortUniqueId = require("short-unique-id");
const uuid = new ShortUniqueId({ length: 8 });
const { transporter } = require("../../../sharedMethod/emailVerify");
const config = require("config");
const Stripe = require('stripe');
const ownStripe = require("stripe")(
  process.env.STRIPE_SECRETKEY_FOR_SUBSCRIPTIONPLAN
);
const sqlQuery = require("./sqlQueries");
const utc = Math.floor(new Date().getTime() / 1000);

let eventRecurringEnum = { ONCE:'ONCE', DAILY:'DAILY', WEEKLY:'WEEKLY', MONTHLY:'MONTHLY' };
let daysEnum = {
  SUNDAY: "SUNDAY",
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY"
};

  // const logQuery = reraConn.format(eventquery, value);
  // // Log the constructed query
  // console.log("Executing Query:", logQuery);

const secret_key = async(userid) =>{
  const stripe_key = await new Promise( (resolve,reject)=> {
    reraConn.query(sqlQuery.userStripeSecretKey, userid, (err,result)=>{
      if(err){
        reject(err);
      }
      if(result && result.length > 0){
        resolve(result[0].stripe_secret_key);
      }else{
        reject(new Error("no stripe details found for the provided userid"));
      }
    });
  });
  return stripe_key;
}

exports.performEventQuery = async (eventquery, eventDetails) => {
  const eventqueryResult = await new Promise((resolve, reject) => {
    reraConn.query(eventquery, [eventDetails], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
  return eventqueryResult;
};

exports.getEvent = async(eventquery, value) => {
  const data = await new Promise((resolve, reject) => {
    reraConn.query(eventquery,value,(error, results) => {
      if (error) {
        reject(error.sqlMessage);
      } else {
        resolve(results);
      }
    });
  });

  data.forEach((row) => {
    row.imageUrls = row.imageUrls ? JSON.parse(row.imageUrls) : null;;
    row.user = row.user ? JSON.parse(row.user) : null;
    row.recurringType = row.recurringType ? JSON.parse(row.recurringType) : null;
    row.singleDay = row.singleDay ? JSON.parse(row.singleDay) : null;
    row.monthlyRecurring = row.monthlyRecurring ? JSON.parse(row.monthlyRecurring) : null;
    row.weeklyRecurring = row.weeklyRecurring ? JSON.parse(row.weeklyRecurring) : null;
    if (row.weeklyRecurring && row.weeklyRecurring.daysOfWeek) {
      row.weeklyRecurring.daysOfWeek = JSON.parse(row.weeklyRecurring.daysOfWeek);
    }
    row.pricingDetails = row.pricingDetails ? JSON.parse(row.pricingDetails) : null;
  });
  return data.length > 0 ? data : new Error("no data found");
}

exports.checkUserStripeDetail = async (userId) => {
  const userStripeResult = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.userStripeInfo, userId, (err, result) => {
      if (err) {
        resolve(false);
      } else {
        if (result[0].has_user_stripe_info != 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });

  return userStripeResult;
};

exports.insertCustomerTicketDetails =async(query,value)=>{

  return await new Promise((resolve, reject) => {
    reraConn.query(query, [value], (err, result) => {
      if (err) {
        reject(err);
      }
      if (result.affectedRows > 0) {
        resolve({
          customer_name: value[0] + " " + value[1],  
          customer_email: value[2],                  
          eventid: value[6],                        
          customerid: result.insertId,
          no_of_ticket: value[4],        
        });
      }
    });
  });
}

exports.updateCustomerTicketDetails = async (query,value) => {
  return await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.updateCustomerPaymentStatus, value, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result.affectedRows > 0) {
        resolve("payment status successfully updated");
      } else {
        reject(new Error("The customer doesn't exist for the associated customer ID"));
      }
    });
  });
}

exports.accessAndModifyEventData = async(query,value)=>{
  return await new Promise((resolve, reject) => {
    reraConn.query(query, value, (err, event) => {
      if (err) {
      reject(err);
      }else{
        resolve(event);
      }
    });
  });
}

exports.manageAvailableSubscription = async(query,value) => {
  return await new Promise((resolve, reject) => {
    reraConn.query(query, value, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result) {
        if(result.affectedRows > 0){
          resolve("Success");
        }
        else if(result.length > 0){
          resolve(result);
        }else{
          reject(new Error("data not found"));
        }     
      }
    });
  });
}

exports.customerDetails = async (query,value) => {
  return await new Promise((resolve, reject) => {
    reraConn.query( query, value, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result && result.length > 0) {
        const customerDetails = result.map((item) => ({
          customerId: item.customer_id,
          firstName: item.first_name,
          lastName: item.last_name,
          email: item.email,
          phoneNumber: item.phone_number,
          eventId: item.event_id,
          eventName: item.title,
          ticketId: item.ticket_id,
          totalTicketBooked: item.no_of_tickets,
          totalPrice: item.total_price,
          presence: item.presence,
          paymentTime: item.paymentTime,
          ticketDetails: JSON.parse(item.ticketDetails),
          dateTicketfor: item.dateTicketBookedfor,
        }));
        resolve(customerDetails);
      } else {
        reject(new Error("no data found"));
      }
    });
  });
};

exports.createEvent = async (req, res) => {
    const {title, description, organizer, userId, category, address,
      eventPattern, timeZone, language, summary, free, paid, startDate,
      endDate, ticketSaleStartDate, ticketSaleEndDate, orgnizerSection,
      refundPolicy, location, start_time, end_time } = req.body ? req.body : req.args;
     
    const hasStripeInfo = await this.checkUserStripeDetail(userId);
    if (!hasStripeInfo) {
      return new Error(
        "No stripe info found. Please update/add your stripe secret or publish key"
      );
    }
    const userSecretKey = await secret_key(userId);
    if (userSecretKey instanceof Error) {
      return userSecretKey;
    }
    const stripe = Stripe(userSecretKey);
    let freeticket =  req.args.freeTicket ? req.args.freeTicket : 0;
    let product;
   
    if(paid === true){
      freeticket = 0;
    try{
       product = await stripe.products.create({
        name: title,
        description: title,
      });
    }catch(error){
      return new Error('Invalid stripe Key provided,kindly check your stripe details');
    }
  }
   
    const origin = req.context.origin;

    const pattern = eventPattern.singleDay ? "singleDay" : "Recurring";

    const eventDetails = [
      title, description, organizer, userId, category, address, pattern,
      timeZone, language, summary, free, paid, startDate, endDate, ticketSaleStartDate,
      ticketSaleEndDate, freeticket, origin, orgnizerSection, refundPolicy, location ];

    const storeEvent = await this.performEventQuery(sqlQuery.insertEventDetails, eventDetails);

    if (storeEvent instanceof Error) {
      return storeEvent;
    }

      let insertEventReccurenceQuery;
      let insertEventReccurenceQueryInput;
      let storeEventReccurenceDetail;

    if(eventPattern.singleDay){
      insertEventReccurenceQuery = sqlQuery.insertSingleDayEvent;
      insertEventReccurenceQueryInput = [storeEvent, start_time, end_time];
      storeEventReccurenceDetail = await this.performEventQuery(insertEventReccurenceQuery, insertEventReccurenceQueryInput);
    }

    if(eventPattern.recurring && eventRecurringEnum.hasOwnProperty(eventPattern.recurring)){
      insertEventReccurenceQuery = sqlQuery.insertEventRecurringType;
      insertEventReccurenceQueryInput = [storeEvent, eventPattern.recurring, start_time, end_time];
      storeEventReccurenceDetail = await this.performEventQuery(insertEventReccurenceQuery, insertEventReccurenceQueryInput);
    }

    if(eventPattern.recurring === eventRecurringEnum.WEEKLY &&
      eventPattern.weekDays.every(day => daysEnum.hasOwnProperty(day))) {
      insertEventReccurenceQuery = sqlQuery.insertEventWeeklyRecurrence;
      insertEventReccurenceQueryInput = [storeEvent, JSON.stringify(eventPattern.weekDays)];
      storeEventReccurenceDetail = await this.performEventQuery(insertEventReccurenceQuery, insertEventReccurenceQueryInput);
    }

    if(eventPattern.monthDate && eventPattern.recurring == eventRecurringEnum.MONTHLY){
      insertEventReccurenceQuery = sqlQuery.insertEventMonthlyRecurrence;
      insertEventReccurenceQueryInput = [storeEvent, eventPattern.monthDate];
      storeEventReccurenceDetail = await this.performEventQuery(insertEventReccurenceQuery, insertEventReccurenceQueryInput);
    }

    if(paid === true){
      const {ticketInfo} = req.body ? req.body : req.args;
   
    const eventPrice = await Promise.all(
      ticketInfo.map(async (evnt) => {
        const price = await stripe.prices.create({
          billing_scheme: "per_unit",
          product: product.id,
          unit_amount_decimal: evnt.price * 100,
          currency: evnt.currency,
        });

    const priceValue = [storeEvent, evnt.label, evnt.description, evnt.ticketQuantity,
      evnt.ticketQuantity, evnt.ticketWarningOn, evnt.currency, evnt.price, price.id, product.id]

        const storeEventPrice = await new Promise((resolve, reject) => {
          reraConn.query(sqlQuery.insertPriceQuery, [priceValue], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.insertId);
            }
          });
        });
        return storeEventPrice;
      })
    );
  }
    return storeEvent;   
};

exports.getEventById = async (req, res) => {
  const { eventId } = req.body || req.args;
  const origin = req.context.origin;
  const vlaue = [eventId,origin]
  return this.getEvent(sqlQuery.eventById,vlaue);
};

exports.getEventByUserId = async (req, res) => {
  const { userid, publishStatus, expire, limit, offset } = req.body || req.args;
  const origin = req.context.origin;
  const value =[userid,publishStatus,origin,limit,offset]
  return this.getEvent(sqlQuery.eventByUserId(expire),value);
};

exports.getAllEvent = async (req, res) => {
  const { publishStatus, limit, offset } = req.body || req.args;
  let booleanStatus = publishStatus ? 1 : 0;
  const origin = req.context.origin;
  const value =[booleanStatus,origin,limit,offset]
  return this.getEvent(sqlQuery.getAllEvent,value);
};

exports.deleteEventsById = async (req, res) => {
  const { eventid } = req.body || req.args;

  const deleteEvent = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.deleteEventById, eventid, (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.affectedRows > 0) {
        resolve("event succesfully deleted");
      } else {
        reject("Event not found");
      }
    });
  });
  return deleteEvent;
};

exports.uploadImageUrl = async (req, res) => {
  const token = req.token || req.headers.authorization;
  const verifyToken = await shared.tokenVerification(token);

  if (verifyToken.valid == false) {
    return new Error(verifyToken.error);
  }
  const { userid, eventid, image_url, caption } = req.body || req.args;

  const value = [eventid,userid];
  const userEventCheck = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.eventByUserIdAndEventId, value, (error, results) => {
      if (error) {
        reject(error);
      }

      if (results.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
  if (userEventCheck == false) {
    return new Error("event doesn't exist");
  }

  const insertValue = [eventid, image_url, caption, userid];
  const updateEventImages = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.insertEventImages, [insertValue], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.affectedRows > 0) {
        resolve("successfully updated");
      }
    });
  });
  return updateEventImages;
};

exports.updateEventPublishStatus = async (req, res) => {
  const { userid, eventid, status, planId } = req.body || req.args;

  const userSubscriptions = await shared.checkUserSubscription(userid);

  if (planId != 1) {
    if (userSubscriptions === false) {
      return new Error("User has no active subscription");
    }
  }
  const subscription = userSubscriptions.title
    ? userSubscriptions.title.trim()
    : "Free";

  const userEventCount = await shared.userPublishedEvent(userid);

  if (userEventCount instanceof Error) {
    return userEventCount;
  }

  let maxEventsAllowed;

  // maximum events allowed based on subscription plan
  switch (subscription) {
    case "Free":
      maxEventsAllowed = 2;
      break;
    case "Basic month":
    case "Basic year":
      maxEventsAllowed = 6;
      break;
    case "Premium month":
    case "Premium year":
      maxEventsAllowed = Infinity; // Unlimited events allowed
      break;
    default:
      maxEventsAllowed = 0; // Default to disallow event publishing
      break;
  }

  //  if user has exceeded maximum events allowed
  if (userEventCount >= maxEventsAllowed) {
    return new Error(
      "User has exceeded the maximum allowed events for their subscription plan."
    );
  }

  const value = [status, userid, eventid]
  const updatePublishStatus = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.publishEvent, value, (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.affectedRows > 0) {
        resolve("Successfully updated");
      } else {
        reject(new Error("Event doesn't exist"));
      }
    });
  });

  return updatePublishStatus;
};

exports.buyNow = async (req, res) => {
  const { first_name, last_name, email, event_id, phoneNumber, ticketDetails, dateTicketFor } = req.body || req.args;

  let totalQuantity = 0;
  let currency;

  ticketDetails.forEach((item) => {
    totalQuantity += item.quantity;
    currency = item.currency;
  });
 
  buyerDetail = [
    first_name, last_name, email, event_id, totalQuantity,
    phoneNumber, utc, utc, dateTicketFor, currency,
  ];
  const insertDetail= await this.insertCustomerTicketDetails(sqlQuery.insertCustomerDetails, buyerDetail);

  if (insertDetail instanceof Error) {
    return insertDetail;
  }

  ticketDetails.forEach(async (item) => {
    const ticketDetail = [
      insertDetail.customerid,
      item.priceId,
      item.quantity,
      item.quantity * item.pricePerTicket,
      item.currency,
      utc,
      utc,
    ];
    await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery.insertCustomerTicketDetails, [ticketDetail], (err, result) => {
        if (err) {
          reject(err);
        }
        if (result.affectedRows > 0) {
          resolve(result);
        }
      });
    });
  });

  return insertDetail;
};

exports.freeEvent_buyNow = async (req, res) => {
  const { first_name, last_name, email, event_id, no_of_tickets, phoneNumber, dateTicketFor } = req.body || req.args;

  buyerDetail = [
    first_name, last_name, email, event_id, no_of_tickets,
    phoneNumber, utc, utc, dateTicketFor, null
  ];
  return await this.insertCustomerTicketDetails(sqlQuery.insertCustomerDetails, buyerDetail);
};


exports.updateCustomerPaymentStatus = async (req, res) => {
  const body = req.body || req.args;
  const { total_price, payment_status, customerid } = body;

  const ticketbuyed = await shared.checkCustomerTicketExist(customerid);
  if (ticketbuyed) {
    return new Error(
      "ticket has been already alotted for provided customerId or the customerId is invalid"
    );
  }

  // genrate event ticketId
  const ticketId = uuid.rnd().toUpperCase();

  const value = [total_price, payment_status, ticketId, customerid]

  const updateDetails = await this.updateCustomerTicketDetails(sqlQuery.updateCustomerPaymentStatus, value);

  const getEvent = await this.accessAndModifyEventData(sqlQuery.customerAndBookedEventDetails, customerid);

  const ticket =JSON.parse(getEvent[0].customerTicket) ;
  for (const item of ticket) {
    const value = [item.ticketbooked, getEvent[0].eventid, item.stripe];
    const ticketUpdation = await this.accessAndModifyEventData(sqlQuery.updateEventTicketQuantity, value);
    }
      const customerName = getEvent[0].cst_firstname + " " + getEvent[0].cst_lastname;
      const origin = req.context.origin;
  
      const userTicketDetails = {
        from: process.env.EMAIL_FROM,
        to: getEvent[0].cst_email,
        subject: 'Confirmation of Event Ticket Booking',
        template: 'customerEventTicketDetails',
        context: {
          cst_Name: customerName,
          eventName: getEvent[0].eventname,
          bookingCustomerName:customerName,
          bookingCustomerEmail:getEvent[0].cst_email,
          bookingCutomerPhoneNumber:getEvent[0].cst_contact,
          ticketId: getEvent[0].cst_ticketid,
          ticketDetails:ticket,
          organizer: getEvent[0].eventorganizer,
          domain: origin,
        }
      };
  
      transporter.sendMail(userTicketDetails, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("email sent");
        }
      });
  return updateDetails;
};

exports.updateCustomerPaymentStatusForFreeEvent = async (req, res) => {
  const body = req.body || req.args;
  const { total_price, payment_status, customerid } = body;

  const ticketbuyed = await shared.checkCustomerTicketExist(customerid);
  if(ticketbuyed){
    return new Error("ticket has been already alotted for provided customerId or the customerId is invalid")
  }

  // genrate event ticketId
  const ticketId =  uuid.rnd().toUpperCase();

    const value = [total_price, payment_status, ticketId, customerid]
    const updateDetails = await this.updateCustomerTicketDetails(sqlQuery.updateCustomerPaymentStatus, value);

    const getEvent = await this.accessAndModifyEventData(sqlQuery.customerAndBookedFreeEventDetails, customerid);

    const ticket = getEvent[0].totalFreeTicket - getEvent[0].cst_totalTicket;

    const value2 = [ticket, getEvent[0].eventid];
    const ticketUpdation = await this.accessAndModifyEventData(sqlQuery.updateEventFreeTicketQuantity, value2);

    customerName = getEvent[0].cst_firstname + " " + getEvent[0].cst_lastname;
    const origin = req.context.origin;
    
    const userTicketDetails = {
      from: process.env.EMAIL_FROM,
      to: getEvent[0].cst_email,
      subject: "Confirmation of Event Ticket Booking",
      template: "customerEventTicketDetails",
      context: {
        cst_Name: customerName,
        eventName: getEvent[0].eventname,
        bookingCustomerName:customerName,
        bookingCustomerEmail:getEvent[0].cst_email,
        bookingCutomerPhoneNumber:getEvent[0].cst_contact,
        ticketId: getEvent[0].cst_ticketid,
        ticketDetails: [
          {
            label: "Free",
            currency: "",
            ticketbooked: getEvent[0].cst_totalTicket,
            perTicketPrice: 0,
            ticketChargespaid: 0,
          },
        ],
        organizer: getEvent[0].organizername,
        domain: origin,
      },
    };

    transporter.sendMail(userTicketDetails, function (error, info) {nn
      if (error) {
        console.log(error);
      } else {
        console.log("email sent");
      }
    });
  return updateDetails;
};

exports.updateCustomerPresence = async(req,res) => {
  const {customerid,present} = req.body || req.args;

const value = [present, customerid];
  return await new Promise((resolve,reject) => {
    reraConn.query(sqlQuery.updateCustomerPresenceInEvent, value,(err,result)=>{
      if(err){
        reject(err);
      }
      if(result && result.affectedRows > 0){
        resolve("updated successfully");
      }
    });
  });
}

// #### unauthticated func ####
exports.iframe_EventById = async (req, res) => {
  const { eventId } = req.body || req.args;
  const origin = req.context.origin;
  const vlaue = [eventId,origin]
  return this.getEvent(sqlQuery.eventById,vlaue);
};
// ######  ######

exports.countEventBookingCustomer = async(req,res) => {
  const {eventId} = req.body || req.args;

  return await new Promise((resolve,reject)=> {
    reraConn.query(sqlQuery.countEventTicketPurchaser, eventId,(err,result) =>{
      if(err){
        reject(err);
      }
      if(result){
        resolve(result.length > 0 ? result[0].customerCount : 0);
      }
    });
  });
}

exports.contactUs = async (req, res) => {

  const { fullname, email, message } = req.body || req.args;

  const contactValues = [fullname, email, message];

  return await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.insertContactDetails, [contactValues], (err, result) => {
      if (err) {
        reject(err);
      }
      if (result && result.affectedRows > 0) {
        resolve({
          data: true,
          msg: `Your message has been sent to our team,
                we will get back to you in few working day's`,
        });
      }
    });
  });
};

exports.stripe_createProduct = async (req, res) => {

    const { userid, productName, productDescription } = req.body || req.args;

    const userSecretKey = await secret_key(userid);
    if(userSecretKey instanceof Error){
    return new Error("stripe details not found for the user")
  }

  const stripe = Stripe(userSecretKey);

  const product = await stripe.products.create({
    name: productName,
    description: productDescription,
  });

    return  {
      productId: product.id,
      product_Description: product.description,
      product_Name: product.name
    } ;
}

exports.stripe_createPrice = async(req,res) => {
    const { userid, productid, amount, currency } = req.body || req.args;
   
    // Create New Price
    const userSecretKey = await secret_key(userid);

    if(userSecretKey instanceof Error){
    return new Error("stripe details not found for the user")
  }
  const stripe = Stripe(userSecretKey);

    const price = await stripe.prices.create({
      billing_scheme: "per_unit",
      product: productid,
      unit_amount_decimal: amount * 100,
      currency: currency,
    });

    return price.id;
 
};

exports.stripe_userStripeInfo = async (req, res) => {
  const { stripe_secret_key, publish_key, userid, update } = req.body || req.args;
  let query;
  let values;

  if ( update === true ) {
    query = sqlQuery.updateUserStripeDetails;
    values = [stripe_secret_key, publish_key, userid];
  } else {
    query = sqlQuery.insertUserStripeDetails;
    values = [stripe_secret_key, publish_key, userid, utc, utc];
  }

  return await new Promise((resolve, reject) => {
    reraConn.query(query, values, (err, result) => {
      if (err) {
        reject(err.sqlMessage);
      } else {
        if (result.affectedRows > 0 || result.insertId > 0) {
          resolve("information saved"); 
        } else {
          reject(new Error("user doesn't exist"));
        }
      }
    });
  });
};


exports.stripe_getUserStripeInfo = async (req, res) => {
  const { userid } = req.body || req.args;

  return await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.userStripeDetails, userid, (err, result) => {
      if (err) {
        reject(err.sqlMessage);
      }
      if (result && result.length > 0) {
        resolve(result[0]);
      } else {
        reject(new Error("user doesn't exist"));
      }
    });
  });
};

exports.stripePaymentLink = async(req,res) => {
  const { userId, ticket, eventId, customerId, totalPrice } =req.body || req.args;

  const userSecretKey = await secret_key(userId);

  if((userSecretKey instanceof Error)){
    return userSecretKey;
  }
  const stripe = Stripe(userSecretKey);

  const paymentLink = await stripe.paymentLinks.create({
    line_items: ticket,
    after_completion: {
      type: "redirect",
      redirect: {
        url: `${config.get(
          "bookable_domain"
        )}/success/?eventid=${eventId}&customerid=${customerId}&totalPrice=${totalPrice}&paymentstatus=true`,
      },
    },
  });
  return paymentLink.url;
};

exports.createSubscription_Available = async (req, res) => {
  const {
    title, description, image, cost, frequency,
    stripe_price_id, stripe_product_id, stripe_product_name,
  } = req.body || req.args;

  const value = [
    title, description, image, cost, frequency,
    stripe_price_id, stripe_product_id, stripe_product_name,
  ];

  return await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery.insertNewSubscription, [value], (err, result) => {
      if (err) {
        reject(err);
      }
      if (result && result.insertId > 0) {
        resolve("Subscription saved");
      }
    });
  });
};

exports.updateSubscription_Available = async (req, res) => {
  const {
        subscriptioId, title, description, image, cost,
        frequency, stripe_price_id, stripe_product_id, stripe_product_name,
      } = req.body || req.args;

      const value = [
                title, description, cost, frequency, stripe_price_id,
                stripe_product_id, stripe_product_name, subscriptioId
              ]
        return this.manageAvailableSubscription(sqlQuery.updateAvailableSubscription(image), value);
};

exports.deletSubscription_Available = async (req, res) => {
  const { subscriptionId } = req.body || req.args;

  return this.manageAvailableSubscription(sqlQuery.deleteAvailableSubscription, subscriptionId);
};

exports.getAllSubscription_Available = async (req, res) => {
  const { subscriptionId } = req.body || req.args;

  return subscriptionId
    ?  this.manageAvailableSubscription(sqlQuery.getAvailableSubscriptionById, subscriptionId)
    :  this.manageAvailableSubscription(sqlQuery.getAllAvailableSubscription, subscriptionId);
};

exports.getCustomerTicketDetails = async (req, res) => {
  const { customerId } = req.body || req.args;
  return await this.customerDetails(sqlQuery.customerTicketDetailById,customerId);
};

exports.getCustomersListByEventId = async (req, res) => {
  const body = req.body || req.args;
  const { eventid, limit, offset, presence } = body;
  let value = [eventid,presence,limit,offset];
  let value2 = [eventid,limit,offset];
  return presence != null
    ? await this.customerDetails(sqlQuery.getEventCustomerByIdAndPresenceStatus,value)
  : await this.customerDetails(sqlQuery.getEventCustomerPresenceInEvent,value2); 
};

exports.changePassword = async(req,res) => {

  const { oldPassword, newPassword, userId } = req.body || req.args;

  const query = `SELECT * from user where id = ${userId}`

  const user = await new Promise((resolve, reject) => {
    reraConn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result &&  result.length <= 0) {
          resolve(new Error("user does not exists"));
        } else {
          resolve(result[0]);
        }
      }
    });
  });

  if ((user instanceof Error)){
    return user;
  }
  const hashedPass = user.password;
    const compare = await shared.comparePassword(oldPassword, hashedPass);

    if (!compare) {
      return new Error("wrong Password");
    }
  
    const hashedPassword = await shared.hashedPassword(newPassword);

    const updatePassword = `UPDATE user SET password = '${hashedPassword}'  WHERE id = ${userId};`

    const updateUserPassword = await new Promise((resolve, reject) => {
      reraConn.query(updatePassword,(err,result) => {
        if(err){
          reject(err);
        }
        if(result && result.affectedRows > 0){
          resolve(true);
        }
      });
    });
    return updateUserPassword;
}

exports.forgetPassword = async (req,res) => {
  const { email } = req.body || req.args;
  const query = `SELECT * FROM user where email = '${email}'`

  const emailExist = await new Promise((resolve,reject)=>{
    reraConn.query(query,(err,result)=> {
      if(err){
        reject(err);
      }
      if(result && result.length > 0) {
        resolve(result[0]);
      } else {
        resolve(new Error("email does not exists"));
      }
    });
  });

  if ((emailExist instanceof Error)){
    return emailExist;
  };
  const origin = req.context.origin;
  const forgetPwdEmailDetails =  {
    from:process.env.EMAIL_FROM,
    to: emailExist.email,
    subject: 'Action Required: Reset Your Password Now',
    template:'forgetPassword',
    context:{
      token:emailExist.uuid,
      userId:emailExist.id,
      domain:origin,
    }    
  };

  transporter.sendMail(forgetPwdEmailDetails, function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("email sent");
    }
  });

  return {message : 'an email has been sent to your email'};
}

exports.changeForgetPassword = async(req,res) => {

  const { newPassword, userId, uid } = req.body || req.args;
  
  const hashedPassword = await shared.hashedPassword(newPassword);

  const query = `UPDATE user set password = '${hashedPassword}' where id = ${userId} AND uuid = '${uid}'`

  const user = await new Promise((resolve, reject) => {
    reraConn.query(query, (err, result) => {
      if (result.affectedRows == 0) {
        resolve(new Error("wrong credentials"));
      } else {
        resolve(result.protocol41);
      }
    });
  });

  if(!(user instanceof Error)){
    const newUUID = uuid.rnd().toUpperCase();
    const updateNewUuid = `update user set uuid = ? where id = ${userId}`;
    reraConn.query(updateNewUuid, newUUID);
  }

  return user;
}

exports.subscriptionSubscribeList = async(req,res) => {
  const {subscriptionId, userId, limit, offset } = req.body || req.args;
  const query = subscriptionId && userId ? 
  `SELECT ss.id as subscriptionPlanId, ss.user_id as userId, ss.email as userEmail, ss.phone_no as phoneNumber,
  ss.plan_choosen as planId, ss.plan_charges as amountPaid, FROM_UNIXTIME(ss.createdAt) as subscribedAt,
  FROM_UNIXTIME(ss.end_date) as endAt, ss.userCanceled as userCanceledAt,ss.status as status, ss.stripe_subscription_id as stripeSubscriptionId,
  sa.title, sa.description, sa.cost, sa.frequency, sa.costNZ, sa.stripe_product_name from Subscription_subscribed
  as ss LEFT JOIN Subscription_Available as sa ON ss.plan_choosen = sa.id where ss.user_id= ${userId} AND
  ss.plan_choosen= ${subscriptionId} limit ${limit} offset ${offset}`
   : 
   userId ? 
   `SELECT ss.id as subscriptionPlanId, ss.user_id as userId, ss.email as userEmail, ss.phone_no as phoneNumber,
   ss.plan_choosen as planId, ss.plan_charges as amountPaid, FROM_UNIXTIME(ss.createdAt) as subscribedAt,
   FROM_UNIXTIME(ss.end_date) as endAt, ss.userCanceled as userCanceledAt,ss.status as status, ss.stripe_subscription_id as stripeSubscriptionId,
   sa.title, sa.description, sa.cost, sa.frequency, sa.costNZ, sa.stripe_product_name from Subscription_subscribed
   as ss LEFT JOIN Subscription_Available as sa ON ss.plan_choosen = sa.id where ss.user_id= ${userId} limit ${limit}
   offset ${offset}`
   : 
   subscriptionId ? 
   ` SELECT ss.id as subscriptionPlanId, ss.user_id as userId, ss.email as userEmail, ss.phone_no as phoneNumber,
   ss.plan_choosen as planId, ss.plan_charges as amountPaid, FROM_UNIXTIME(ss.createdAt) as subscribedAt,
   FROM_UNIXTIME(ss.end_date) as endAt, ss.userCanceled as userCanceledAt,ss.status as status, ss.stripe_subscription_id as stripeSubscriptionId,
   sa.title, sa.description, sa.cost, sa.frequency, sa.costNZ, sa.stripe_product_name from Subscription_subscribed
   as ss LEFT JOIN Subscription_Available as sa ON ss.plan_choosen = sa.id where ss.plan_choosen= ${subscriptionId}
   limit ${limit} offset ${offset}`
   : 
   `SELECT ss.id as subscriptionPlanId, ss.user_id as userId, ss.email as userEmail, ss.phone_no as phoneNumber,
   ss.plan_choosen as planId, ss.plan_charges as amountPaid, FROM_UNIXTIME(ss.createdAt) as subscribedAt,
   FROM_UNIXTIME(ss.end_date) as endAt, ss.userCanceled as userCanceledAt,ss.status as status, ss.stripe_subscription_id as stripeSubscriptionId,
   sa.title, sa.description, sa.cost, sa.frequency, sa.costNZ, sa.stripe_product_name from Subscription_subscribed
   as ss LEFT JOIN Subscription_Available as sa ON ss.plan_choosen = sa.id limit  ${limit} offset  ${offset}`;

   const subscriptionList = await new Promise((resolve,reject) => {
    reraConn.query(query,(err,result) => {
      if(err){
        reject(err);
      }
      if(result && result.length > 0){
        resolve(result)
      }else{
        resolve(new Error('no data found'));
      }
    });
   });

   return subscriptionList;

}