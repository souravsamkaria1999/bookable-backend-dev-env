const paymentTypeDefs = `
scalar Date
scalar JSON
scalar Bigint

type response_setupIntent{
    clientSecret : String
}

type response_CreateCustomer{
    customerId: String
}

type response_PublishKey{
    publishableKey: String
}

type response_cancelSubscription{
    subscription: String!
}

type respons_etupIntent{
    internal_subscriptionid: Int
    setup_intent_id: String
    customerid: String
    priceid: String
    trialdays: String 
}


type response_SetupIntent {
    id: String!
    object: String!
    automatic_payment_methods: AutomaticPaymentMethods
    created: Int!
    customer: String!
    latest_attempt: String!
    livemode: Boolean!
    payment_method: String!
    payment_method_configuration_details: PaymentMethodConfigurationDetails
    payment_method_options: PaymentMethodOptions
    payment_method_types: [String!]!
    status: String!
    usage: String!
  }
  
  type AutomaticPaymentMethods {
    allow_redirects: String
    enabled: Boolean
  }
  
  type PaymentMethodConfigurationDetails {
    id: String!
    parent: String
  }
  
  type PaymentMethodOptions {
    card: CardOptions
  }
  
  type CardOptions {
    mandate_options: String
    network: String
    request_three_d_secure: String
  }

type response_subscription{
    id: String
    invoice: String
}

type response_retrieveSetupIntentAndCreateSubscritpion{
    subscription: response_subscription
    setupIntent: response_SetupIntent
    message:String
}

type Mutation{

    payment_getPublishKey(
        publishKey:Boolean
    ):response_PublishKey

    payment_setupIntent(
        customerid: String
    ):response_setupIntent

    payment_retrieveSetupIntentAndCreateSubscription(
        subscriptionId: Int!
        userId: Int!
        customerid: String!
        setupIntentId: String!
        priceid: String!
    ):response_retrieveSetupIntentAndCreateSubscritpion

    payment_CreateCustomer(
        userid: Int!
        username: String!
        useremail: String!
        userphone_no: Bigint!
        address: stripeCreateCustomerAddress
    ):response_CreateCustomer

    payment_cancelSubscription(
        userId: Int!
        planId: Int!
        userStripeSubscriptionId : String!
    ): response_cancelSubscription

    }

    input stripeCreateCustomerAddress {
        city: String!
        country: String!
        line1: String
        line2: String
        postal_code: String!
        state: String!
      }
`;

module.exports = paymentTypeDefs;
