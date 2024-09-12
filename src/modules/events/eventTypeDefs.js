const eventsTypeDefs = `
scalar Date
scalar JSON
scalar Bigint
scalar MonthDay

type image {
    id:Int!
    image_url: String!
  }

type userStripeInfo{
    id: Int
    stripe_secret_key: String
    publish_key: String
    createdAt: Bigint
    updatedAt: Bigint
}

  type buynow{
    customer_name:String!
    customer_email : String!
    eventid : Int!
    customerid : Int!
    no_of_ticket : Int!
  }

  type response{
    msg:String
    data: Boolean
  }

  type stripeProductResponse{
    productId: String
    product_Description: String
    product_Name: String
  }

  type Subscription_AvailableDetail{
    id:Int!
    title: String!
    description: String!
    image: String
    cost:String!
    costNZ:String!
    frequency: String!
    stripe_price_id: String!
    stripe_product_id: String!
    stripe_product_name: String!
  }

  type customerBookedTicketDetails{
    customerId: Int
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
    eventId: Int
    eventName: String
    ticketId: String
    totalTicketBooked: Int
    totalPrice: Float
    presence: Int
    paymentTime: String
    ticketDetails: [TicketDetails]
    dateTicketfor: Int
  }
 
  type TicketDetails {
    label: String
    ticketbooked: Int
    perTicketPrice: Float
    totalChargespaid: Float
    currency: String
  } 
  
  type forgetPassword{
    message: String
  }

  type response_subscribedList{
    subscriptionPlanId:Int!
    userId:Int!
    stripeSubscriptionId: String!
    userEmail:String!
    phoneNumber:Bigint
    planId:Int!
    amountPaid:Int!
    subscribedAt:String!
    endAt:String
    title:String
    description:String
    cost:String
    costNZ:String
    frequency:String
    stripe_product_name:String
    userCanceledAt:String
    status: String
  }

 type newEventResponse {
  id: Int
  title: String
  description: String
  organizer: String
  user_id: Int
  category: String
  address: String
  eventPattern: String
  timeZone: String
  language: String
  summary: String
  free: Int
  paid: Int
  publish: Int
  startDate: Bigint
  endDate: Bigint
  ticketSaleStartDate: Int
  ticketSaleEndDate: Int
  totalTicketInFreeEvent: Int
  createdAt: String
  updatedAt: String
  user: User
  organizerSection: String
  refundPolicy: String
  location: String
  imageUrls: [Image]
  recurringType: RecurringType
  monthlyRecurring: MonthlyRecurring
  singleDay: SingleDay
  weeklyRecurring: WeeklyRecurring
  pricingDetails: [PricingDetail]
}

type Image {
  id: Int!
  url: String!
}

type User {
  id: ID
  name: String
  email: String
  username: String
}

type MonthlyRecurring{
id: ID
date: Int
}

type RecurringType {
  id: Int
  type: String
  end_time: Bigint
  start_time: Bigint
}

type SingleDay { 
  id: Int
  end_time: Bigint
  start_time: Bigint 
}

type WeeklyRecurring {
  id: Int
  daysOfWeek: [String]
}

type PricingDetail {
  id: Int!
  label: String!
  price: Float!
  priceId: String!
  currency: String!
  productId: String!
  description: String!
  warningMsgOn: Int!
  ticketQuantity: Int!
}
  


  type Query{
    event_getEventById(eventId:Int!): [newEventResponse]
    event_getEventByUserId(userid:Int! publishStatus:Boolean! expire:Boolean! limit:Int! offset:Int!):[newEventResponse]
    event_getAllEvent(publishStatus:Boolean! limit:Int! offset:Int!):[newEventResponse]
    event_getBookingCustomersList(eventid:Int! limit:Int! offset:Int! presence:Boolean):[customerBookedTicketDetails!]!
    event_getCustomerTicketDetails(customerId:Int!):customerBookedTicketDetails!
    event_countEventBookingCustomer(eventId:Int!):Int!
    iframe_getEventByid(eventId:Int!): [newEventResponse]
    stripe_getUserStripeInfo(userid:Int!):userStripeInfo
    sub_getAllSubscription_Available(subscriptionId:Int):[Subscription_AvailableDetail]
    sub_getSubscriptionSubscribedList(subscriptionId:Int, userId:Int, limit:Int!, offset:Int!):[response_subscribedList!]
  }

type Mutation{
    event_createEvent(
        title: String!
        description: String!
        organizer: String!
        userId: Int!
        category: String!
        address:String
        location: String
        eventPattern: patternOfEvent
        timeZone: String!
        language: String
        summary:String
        free:Boolean!
        paid:Boolean!
        freeTicket:Int
        startDate: Bigint!
        endDate: Bigint!
        start_time: Bigint!
        end_time: Bigint!
        ticketSaleStartDate: Bigint!
        ticketSaleEndDate: Bigint!
        ticketInfo: [ticketDetails]
        orgnizerSection: String
        refundPolicy:String
    ): Int

    event_deleteEvent(
        eventid: Int!
    ):String

    event_uploadImageUrl(
        userid: Int!
        eventid: Int!
        image_url: String!
        caption: String
    ):String

    event_updateEventPublishStatus(
        userid: Int!
        eventid: Int!
        planId : Int!
        status: Boolean!
    ):String

    event_resendTicketDetails(
        cst_Name: String!
        ticketId: String!
        eventName: String!
        email: String!
        ticketDetails:[resendTicketDetail]!
        organizerName: String!
    ):String

    event_buyNow(
        first_name: String!
        last_name: String!
        email: String!
        event_id: Int!
        phoneNumber: String!
        ticketDetails:[customerTicketDetail]!
        dateTicketFor: Bigint!
    ):buynow

    event_freeEventBuyNow(
      first_name: String!
      last_name: String!
      email: String!
      event_id: Int!
      no_of_tickets:Int!
      phoneNumber: String!
      dateTicketFor: Bigint!
    ):buynow

    event_updateCustomerPaymentStatus(
        customerid:Int!
        total_price:String!
        payment_status:Boolean!
    ):String

    event_updateCustomerPaymentStatusForFreeEvent(
      customerid:Int!
      total_price:String!
      payment_status:Boolean!
    ):String

    event_updateCustomerAttendence(
        customerid:Int!
        present:Boolean!
    ):String

    event_PaymentLink(
      userId: Int!
      ticket:[lineItem]!
      eventId: Int!
      customerId: Int!
      totalPrice:Int!
    ):String

    contactUs(
        fullname: String!
        email: String!
        message: String!
    ):response

    stripe_CreateProduct(
        userid:Int!
        productName: String!
        productDescription: String
    ): stripeProductResponse

    stripe_CreatePrice(
        userid:Int!
        productid: String!
        amount: Int!
        currency: String!
    ):String

    stripe_userStripeInfo(
        stripe_secret_key: String!
        publish_key: String!
        userid: Int!
        update: Boolean
    ):String

    sub_createSubscription_Available(
        title: String!
        description: String!
        image: String
        cost:String!
        frequency: String!
        stripe_price_id: String!
        stripe_product_id: String!
        stripe_product_name: String!
    ):String

    sub_updateSubscription_Available(
        subscriptioId:Int!
        title: String!
        description: String!
        image: String
        cost:String!
        frequency: String!
        stripe_price_id: String!
        stripe_product_id: String!
        stripe_product_name: String!
    ):String

    sub_deleteSubscription_Available(
        subscriptionId:Int!
    ):String

    auth_ChangePassword(
        oldPassword: String!
        newPassword: String!
        userId: Int!
    ): Boolean

    auth_ForgetPassword(
        email:String!
    ):forgetPassword

    auth_changeForgetPassword(
        newPassword:String
        userId:Int
        uid:String
    ):Boolean

    }

    input patternOfEvent {
      singleDay: Boolean
      recurring: eventRecurringEnum
      weekDays: [daysEnum]
      monthDate: MonthDay
    }

    enum eventRecurringEnum { 
      ONCE
      DAILY
      WEEKLY
      MONTHLY
    }

    enum daysEnum {
      SUNDAY
      MONDAY
      TUESDAY
      WEDNESDAY
      THURSDAY
      FRIDAY
      SATURDAY
    }

    input ticketDetails {
        label:String!
        description: String!
        ticketQuantity:Int!
        ticketWarningOn:Int
        price:Int!
        currency:String!
    }

    input lineItem {
      price: String
      quantity: Int
    }

    input customerTicketDetail {
      priceId: String!
      quantity: Int!
      pricePerTicket:Int!
      currency: String!
    }

    input resendTicketDetail {
      label: String!
      perTicketPrice: Int!
      currency: String!
      ticketbooked: Int!
      ticketChargespaid:Int!
    }
`;

module.exports = eventsTypeDefs;