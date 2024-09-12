const sharedMethod = require("../../../sharedMethod/sharedMethod");
const { reraConn } = require("../../../dbconfig");
const stripe = require("stripe")(
  process.env.STRIPE_SECRETKEY_FOR_SUBSCRIPTIONPLAN
);
const ShortUniqueId = require("short-unique-id");
const uuid = new ShortUniqueId({ length: 8 });

exports.getpublishkey = async (req, res) => {
  try {
    const { publishKey } = req.body || req.args;

    return publishKey
      ? { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY }
      : "";
  } catch (error) {
    return new ServiceError(400, error.message);
  }
};

exports.setupIntent = async (req, res) => {
  try {
    const { customerid } = req.body || req.args;
    const setup_intent = await stripe.setupIntents.create({
      customer: customerid,
      usage: "off_session",
    });
    return { clientSecret: setup_intent.client_secret };
  } catch (error) {
    return error;
  }
};

exports.retrieveSetupIntentAndCreateSubscription = async (req, res) => {
  try {
    const { subscriptionId, userId, customerid, setupIntentId, priceid } =
      req.body || req.args;
      let message = "";
      const alreadyPurchased = await sharedMethod.checkUserSubscription(userId);

      if (alreadyPurchased != false) {
        return new Error ("User already has an active subscription");
      }

    // Get SetupIntent and Create Subscription and Set Default Payment
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    let payload = {
      customer: customerid,
      items: [
        {
          price: priceid,
        },
      ],
      default_payment_method: setupIntent.payment_method,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: 'on_subscription' },
      // expand: ["latest_invoice.payment_intent"],
      off_session: true,
      // payment_settings: {
      //   payment_method_options: {
      //     card: { mandate_options: { amount: 499, amount_type: "fixed" } },
      //   },
      // },
    };
 
    const subscription = await stripe.subscriptions.create(payload);
  
    const defaultPMset = await stripe.subscriptions.update(subscription.id, {
      default_payment_method: setupIntent.payment_method,
    });
    
      const SubscriptionDetail = `select * from Subscription_Available where id = ${subscriptionId}`;

      const getsubcriptionDetails = await new Promise((resolve, reject) => {
        reraConn.query(SubscriptionDetail, (err, result) => {
          if (err) {
            reject(err);
          }
          if (result && result.length > 0) {
            resolve(result[0]);
          }
        });
      });
   
      const userDetails = `select * from user where id= ${userId}`;

      const getUserDetails = await new Promise((resolve, reject) => {
        reraConn.query(userDetails, (err, result) => {
          if (err) {
            reject(err);
          }
          if (result && result.length) {
            resolve(result[0]);
          }
        });
      });
      
      const newSubscription = `INSERT INTO Subscription_subscribed (user_id,name, email, phone_no, plan_choosen,
        plan_charges, stripe_subscription_id, createdAt, updatedAt) Values(?);`;
      const createdTime = Math.floor(new Date().getTime() / 1000);
      const subscriptionValues = [
        userId,
        getUserDetails.name,
        getUserDetails.email,
        getUserDetails.phoneNumber,
        getsubcriptionDetails.id,
        getsubcriptionDetails.cost,
        subscription.id,
        createdTime,
        createdTime,
      ];

      const createSubscription = await new Promise((resolve, reject) => {
        reraConn.query(newSubscription, [subscriptionValues], (err, result) => {
          if (err) {
            reject(err);
          }
          if (result) {
            resolve(result);
          }
        });
      });
      message = "success";
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
 
      return {
        subscription: {
          id: subscription.id,
          invoice: invoice.hosted_invoice_url,
        },
        setupIntent: setupIntent,
        message: message,
      };
    
  } catch (err) {
    return err;
  }
};

exports.stripe_createCustomer = async (req, res) => {
  const { userid, username, useremail, userphone_no, address } =
    req.body || req.args;
  let customer = null;
console.log('STRIPE_SECRETKEY_FOR_SUBSCRIPTIONPLAN');
  customer = await stripe.customers.create({
    email: useremail,
    name: username,
    phone: userphone_no,
    address: {
      line1: address?.[0].line1 ?? null,
      line2: address?.[0].line2 ?? null,
      city: address?.[0].city ?? null,
      state: address?.[0].state ?? null,
      postal_code: address?.[0].postal_code ?? null,
      country: address?.[0].country ?? null,
    },
  });

  const userquery = `SELECT * FROM user WHERE id = ?`;

  const userExist = await new Promise((resolve, reject) => {
    reraConn.query(userquery, userid, (err, result) => {
      if (err) {
        res?.json({
          status: "false",
          code: 404,
          error: err.sqlMessage,
        });
        return new Error(err.sqlMessage);
      }
      if (result.length > 0) {
        res?.json({ status: true, code: 200, userID: result[0].id });
        resolve({ status: true, code: 200, userID: result[0].id });
        return { status: true, code: 200, userID: result[0].id };
      } else {
        resolve("user doesn't exist");
        return new Error("user doesn't exist");
      }
    });
  });

  if (userExist.status != true) {
    res?.json({ status: false, code: 404, error: userExist?.error });
    return userExist;
  }

  const updatequery = `UPDATE user SET stripe_customer_id = '${customer.id}' WHERE id = ${userExist.userID}`;
  const updateStripeCustomerId = await new Promise((resolve, reject) => {
    reraConn.query(updatequery, (err, result) => {
      if (err) {
        reject(err);
      } else if (result.affectedRows > 0) {
        res?.json({ status: true, code: 200 });
        resolve({ status: true, code: 200 });
      }
    });
  });

  if (!updateStripeCustomerId?.status) {
    updateStripeCustomerId;
  }

  res?.json({ status: true, customerId: customer.id });
  return { customerId: customer.id };
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { userId, planId, userStripeSubscriptionId } = req.body || req.args;
    // Cancel Subscription
    const cancelUserSubscription = await stripe.subscriptions.cancel(
      userStripeSubscriptionId
    );
    const currentDate = Math.floor(new Date().getTime() / 1000);
    const cancelSubscriptionQuery = `UPDATE Subscription_subscribed SET userCanceled = ${currentDate}
    where user_id = ${userId} AND plan_choosen= ${planId} AND userCanceled is NULL`;

    const updateUserSubscriptionStatus = await new Promise(
      (resolve, reject) => {
        reraConn.query(cancelSubscriptionQuery, (err, result) => {
          if (err) {
            reject(err);
          }
          if (result && result.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(new Error("user has not purchased this subscription"));
          }
        });
      }
    );

    return { subscription: cancelUserSubscription.status };
  } catch (error) {
    return new Error(error.message);
  }
};

exports.stripeWebhhok = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.WEBHOOKENDPOINTSECRET);
  
  } catch (err) {
  
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.updated":
      if (event.data.object.status === "active") {
        const updateQuery = `UPDATE Subscription_subscribed SET status = '${event.data.object.status}'
            WHERE stripe_subscription_id = '${event.data.object.id}'`;

        try {
          const updateUserSubscriptionEndDate = await new Promise(
            (resolve, reject) => {
              reraConn.query(updateQuery, (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(
                    `Subscription status updated to ${event.data.object.status} for ${event.data.object.id}`
                  );
                }
              });
            }
          );
        } catch (error) {
          console.error(
            `Error updating subscription status for ${event.data.object.id}: ${error}`
          );
          return;
        }
      }
      break;

    default:
      return;
  }

  // Return a 200 response to acknowledge receipt of the event
  response.sendStatus(200).end();
};
