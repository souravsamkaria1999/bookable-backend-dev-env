const utc = Math.floor(new Date().getTime() / 1000);

exports.userStripeSecretKey = `SELECT * from userStripeInfo where userid = ?`;

exports.userStripeInfo = `SELECT CASE WHEN EXISTS (SELECT id FROM userStripeInfo WHERE userid = ?)
  THEN TRUE ELSE FALSE END AS has_user_stripe_info;`;

exports.insertEventDetails = `INSERT INTO event (title, description, organizer, user_id, category,
      address, eventPattern, timeZone, language, summary, free, paid, startDate, endDate, ticketSaleStartDate,
      ticketSaleEndDate, totalTicketInFreeEvent, domain, organizerSection, refundPolicy, location ) VALUES (?)`;

exports.insertPriceQuery = `INSERT INTO eventTicketPrice (eventId,label, description, ticketQuantity,
totalTicket, ticketWarningThreshold, currency, price, stripePriceId, stripeProductId) VALUES (?)`;

exports.insertSingleDayEvent = `INSERT INTO SingleDayEvent(event_id, start_time, end_time) VALUES (?)`;

exports.insertEventRecurringType = `INSERT INTO RecurringEvent(event_id, recurrence_type, start_time, end_time) VALUES(?)`;

exports.insertEventWeeklyRecurrence = `INSERT INTO WeeklyRecurrence (recurring_event_id, day_of_week) VALUES(?)`;

exports.insertEventMonthlyRecurrence = `INSERT INTO MonthlyRecurrence (recurring_event_id, day_of_month) VALUES(?)`;

exports.deleteEventById = `delete FROM event WHERE id = ?`;

exports.eventByUserIdAndEventId = `SELECT * FROM event WHERE id = ? AND user_id = ?;`;

exports.insertEventImages = "INSERT INTO events_images (event_id, image_url, caption, user_id) VALUES (?);";

exports.publishEvent = `UPDATE event SET publish = ? WHERE user_id = ? AND id = ?;`;

exports.eventById = `SELECT event.id, event.title, event.description, event.organizer, event.user_id, event.category,
 event.address, event.eventPattern, event.timeZone, event.language, event.summary, event.free, event.paid, event.publish,
    event.startDate, event.endDate, event.ticketSaleStartDate, event.ticketSaleEndDate, event.totalTicketInFreeEvent,
    event.createdAt, event.updatedAt, 
    JSON_OBJECT(
        'id', user.id, 
        'name', user.name, 
        'email', user.email, 
        'username', user.userName
    ) AS user,
    event.organizerSection, 
    event.refundPolicy, 
    event.location, 
       CASE
        WHEN COUNT(events_images.image_id) = 0 THEN NULL
        ELSE JSON_ARRAYAGG(
            JSON_OBJECT('id', CAST(events_images.image_id AS UNSIGNED), 'url', events_images.image_url)
        )
    END AS imageUrls,
    CASE
        WHEN MAX(re.event_id) IS NULL AND MAX(re.recurrence_type) IS NULL AND MAX(re.start_time) IS NULL AND MAX(re.end_time) IS NULL THEN NULL
        ELSE JSON_OBJECT('id', CAST(MAX(re.event_id) AS UNSIGNED), 'type', MAX(re.recurrence_type), 'start_time', MAX(re.start_time), 'end_time', MAX(re.end_time))
    END AS recurringType,
    CASE
        WHEN MAX(mr.recurring_event_id) IS NULL AND MAX(mr.day_of_month) IS NULL THEN NULL
        ELSE JSON_OBJECT('id', CAST(MAX(mr.recurring_event_id) AS UNSIGNED), 'date', MAX(mr.day_of_month))
    END AS monthlyRecurring,
    CASE
        WHEN MAX(sde.event_id) IS NULL THEN NULL
        ELSE JSON_OBJECT('id', CAST(MAX(sde.event_id) AS UNSIGNED), 'start_time', MAX(sde.start_time), 'end_time', MAX(sde.end_time))
    END AS singleDay,
    CASE
        WHEN MAX(wr.recurring_event_id) IS NULL THEN NULL
        ELSE JSON_OBJECT(
        'id', CAST(MAX(wr.recurring_event_id) AS UNSIGNED),
        'daysOfWeek', MAX(wr.day_of_week)
    ) END AS weeklyRecurring,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', id,
                'label', label, 
                'description', description,  
                'ticketQuantity', ticketQuantity,
                'warningMsgOn', ticketWarningThreshold, 
                'currency', currency, 
                'price', price, 
                'priceId', stripePriceId, 
                'productId', stripeProductId
            )
        )
        FROM eventTicketPrice WHERE event.id = eventTicketPrice.eventId
    ) AS pricingDetails
FROM event
LEFT JOIN events_images ON event.id = events_images.event_id
LEFT JOIN user ON event.user_id = user.id
LEFT JOIN MonthlyRecurrence mr ON event.id = mr.recurring_event_id
LEFT JOIN RecurringEvent re ON event.id = re.event_id
LEFT JOIN SingleDayEvent sde ON event.id = sde.event_id
LEFT JOIN WeeklyRecurrence wr ON event.id = wr.recurring_event_id
WHERE event.id = ? AND event.domain = ?
GROUP BY event.id, user.id, user.name, user.email, user.userName`;

exports.eventByUserId = (expire) => {
  return `SELECT event.id, event.title, event.description, event.organizer, event.user_id, event.category,
event.address, event.eventPattern, event.timeZone, event.language, event.summary, event.free, event.paid, event.publish,
   event.startDate, event.endDate, event.ticketSaleStartDate, event.ticketSaleEndDate, event.totalTicketInFreeEvent,
   event.createdAt, event.updatedAt, 
   JSON_OBJECT(
       'id', user.id, 
       'name', user.name, 
       'email', user.email, 
       'username', user.userName
   ) AS user,
   event.organizerSection, 
   event.refundPolicy, 
   event.location, 
          CASE
        WHEN COUNT(events_images.image_id) = 0 THEN NULL
        ELSE JSON_ARRAYAGG(
            JSON_OBJECT('id', CAST(events_images.image_id AS UNSIGNED), 'url', events_images.image_url)
        )
    END AS imageUrls,
   CASE
       WHEN MAX(re.event_id) IS NULL AND MAX(re.recurrence_type) IS NULL AND MAX(re.start_time) IS NULL AND MAX(re.end_time) IS NULL THEN NULL
       ELSE JSON_OBJECT('id', CAST(MAX(re.event_id) AS UNSIGNED), 'type', MAX(re.recurrence_type), 'start_time', MAX(re.start_time), 'end_time', MAX(re.end_time))
   END AS recurringType,
   CASE
       WHEN MAX(mr.recurring_event_id) IS NULL AND MAX(mr.day_of_month) IS NULL THEN NULL
       ELSE JSON_OBJECT('id', CAST(MAX(mr.recurring_event_id) AS UNSIGNED), 'date', MAX(mr.day_of_month))
   END AS monthlyRecurring,
   CASE
       WHEN MAX(sde.event_id) IS NULL THEN NULL
       ELSE JSON_OBJECT('id', CAST(MAX(sde.event_id) AS UNSIGNED), 'start_time', MAX(sde.start_time), 'end_time', MAX(sde.end_time))
   END AS singleDay,
   CASE
       WHEN MAX(wr.recurring_event_id) IS NULL THEN NULL
       ELSE JSON_OBJECT(
       'id', CAST(MAX(wr.recurring_event_id) AS UNSIGNED),
       'daysOfWeek', MAX(wr.day_of_week)
   ) END AS weeklyRecurring,
   (
       SELECT JSON_ARRAYAGG(
           JSON_OBJECT(
               'id', id,
               'label', label, 
               'description', description,  
               'ticketQuantity', ticketQuantity,
               'warningMsgOn', ticketWarningThreshold, 
               'currency', currency, 
               'price', price, 
               'priceId', stripePriceId, 
               'productId', stripeProductId
           )
       )
       FROM eventTicketPrice WHERE event.id = eventTicketPrice.eventId
   ) AS pricingDetails
FROM event
LEFT JOIN events_images ON event.id = events_images.event_id
LEFT JOIN user ON event.user_id = user.id
LEFT JOIN MonthlyRecurrence mr ON event.id = mr.recurring_event_id
LEFT JOIN RecurringEvent re ON event.id = re.event_id
LEFT JOIN SingleDayEvent sde ON event.id = sde.event_id
LEFT JOIN WeeklyRecurrence wr ON event.id = wr.recurring_event_id
 WHERE event.user_id = ? AND 
 event.publish = ? AND domain = ?
 AND ${expire == true ? `event.endDate < ${utc}` : `event.endDate > ${utc}`}
 GROUP BY event.id, user.id LIMIT ? OFFSET ?`;
};

exports.getAllEvent = `SELECT event.id, event.title, event.description, event.organizer, event.user_id, event.category,
 event.address, event.eventPattern, event.timeZone, event.language, event.summary, event.free, event.paid, event.publish,
    event.startDate, event.endDate, event.ticketSaleStartDate, event.ticketSaleEndDate, event.totalTicketInFreeEvent,
    event.createdAt, event.updatedAt, 
    JSON_OBJECT(
        'id', user.id, 
        'name', user.name, 
        'email', user.email, 
        'username', user.userName
    ) AS user,
    event.organizerSection, 
    event.refundPolicy, 
    event.location, 
           CASE
        WHEN COUNT(events_images.image_id) = 0 THEN NULL
        ELSE JSON_ARRAYAGG(
            JSON_OBJECT('id', CAST(events_images.image_id AS UNSIGNED), 'url', events_images.image_url)
        )
    END AS imageUrls,
    CASE
        WHEN MAX(re.event_id) IS NULL AND MAX(re.recurrence_type) IS NULL AND MAX(re.start_time) IS NULL AND MAX(re.end_time) IS NULL THEN NULL
        ELSE JSON_OBJECT('id', CAST(MAX(re.event_id) AS UNSIGNED), 'type', MAX(re.recurrence_type), 'start_time', MAX(re.start_time), 'end_time', MAX(re.end_time))
    END AS recurringType,
    CASE
        WHEN MAX(mr.recurring_event_id) IS NULL AND MAX(mr.day_of_month) IS NULL THEN NULL
        ELSE JSON_OBJECT('id', CAST(MAX(mr.recurring_event_id) AS UNSIGNED), 'date', MAX(mr.day_of_month))
    END AS monthlyRecurring,
    CASE
        WHEN MAX(sde.event_id) IS NULL THEN NULL
        ELSE JSON_OBJECT('id', CAST(MAX(sde.event_id) AS UNSIGNED), 'start_time', MAX(sde.start_time), 'end_time', MAX(sde.end_time))
    END AS singleDay,
    CASE
        WHEN MAX(wr.recurring_event_id) IS NULL THEN NULL
        ELSE JSON_OBJECT(
        'id', CAST(MAX(wr.recurring_event_id) AS UNSIGNED),
        'daysOfWeek', MAX(wr.day_of_week)
    ) END AS weeklyRecurring,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', id,
                'label', label, 
                'description', description,  
                'ticketQuantity', ticketQuantity,
                'warningMsgOn', ticketWarningThreshold, 
                'currency', currency, 
                'price', price, 
                'priceId', stripePriceId, 
                'productId', stripeProductId
            )
        )
        FROM eventTicketPrice WHERE event.id = eventTicketPrice.eventId
    ) AS pricingDetails
FROM event
LEFT JOIN events_images ON event.id = events_images.event_id
LEFT JOIN user ON event.user_id = user.id
LEFT JOIN MonthlyRecurrence mr ON event.id = mr.recurring_event_id
LEFT JOIN RecurringEvent re ON event.id = re.event_id
LEFT JOIN SingleDayEvent sde ON event.id = sde.event_id
LEFT JOIN WeeklyRecurrence wr ON event.id = wr.recurring_event_id
WHERE event.publish = ? AND domain = ? AND event.endDate > ${utc}
GROUP BY event.id, user.name, user.email, user.userName limit ? offset ?`;

exports.insertCustomerDetails = `INSERT INTO customer_detail (first_name,last_name,email, event_id,
  no_of_tickets, phone_number, created_at, updated_at, dateTicketBookedfor,currency) VALUES(?)`;

exports.insertCustomerTicketDetails = `INSERT INTO customerTicketDetails (customerId, stripePriceId, totalTicket,totalPrice,
      currency,createdAt,updatedAt) VALUES(?)`;

exports.updateCustomerPaymentStatus = `UPDATE customer_detail SET 
  total_price = CASE WHEN total_price IS NULL THEN ? ELSE total_price END,
  payment_status = CASE WHEN payment_status IS False THEN ? ELSE payment_status END,
  payment_datetime = CASE WHEN payment_datetime IS NULL THEN ${utc} ELSE payment_datetime END,
  updated_at = CASE WHEN payment_datetime IS NULL THEN ${utc} ELSE updated_at END,
  ticket_id = CASE WHEN ticket_id IS NULL THEN ? ELSE ticket_id END
  WHERE customer_id = ?`;

exports.customerAndBookedEventDetails = `SELECT DISTINCT
  event.id AS eventid, 
  event.title AS eventname,
  event.organizer AS eventorganizer,
  eventTicketPrice.price AS per_ticketPrice,
  eventTicketPrice.ticketQuantity AS evticket,
  user.email AS organizeremail,
  user.name AS organizername,
  customer_detail.first_name AS cst_firstname,
  customer_detail.last_name AS cst_lastname,
  customer_detail.email AS cst_email,
  customer_detail.phone_number AS cst_contact,
  customer_detail.ticket_id AS cst_ticketid,
  customer_detail.no_of_tickets AS cst_totalTicket,
  customer_detail.total_price AS cst_chargespaid,
  (
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'label', label,
            'stripe', customerTicketDetails.stripePriceId,
            'ticketbooked', customerTicketDetails.totalTicket,
            'ticketChargespaid', totalPrice,
            'perTicketPrice', ROUND(totalPrice/customerTicketDetails.totalTicket,2),
            'currency',eventTicketPrice.currency
        )
    )
    FROM customerTicketDetails
    LEFT JOIN eventTicketPrice ON eventTicketPrice.stripePriceId = customerTicketDetails.stripePriceId
    WHERE customerTicketDetails.customerId = customer_detail.customer_id
  ) AS customerTicket
  FROM customer_detail
  LEFT JOIN eventTicketPrice ON customer_detail.event_id = eventTicketPrice.eventId
  LEFT JOIN event ON customer_detail.event_id = event.id
  LEFT JOIN user ON user.id = event.user_id
  WHERE customer_detail.customer_id = ? limit 1`;

exports.updateEventTicketQuantity =  `UPDATE eventTicketPrice SET ticketQuantity = ticketQuantity - ?
WHERE eventId = ? AND stripePriceId = ?`;

exports.customerAndBookedFreeEventDetails = `SELECT
    event.id AS eventid, 
    event.title AS eventname,
    event.totalTicketInFreeEvent AS totalFreeTicket,
    user.email AS organizeremail,
    user.name as organizername,
    customer_detail.first_name AS cst_firstname,
    customer_detail.last_name AS cst_lastname,
    customer_detail.email AS cst_email,
    customer_detail.ticket_id AS cst_ticketid,
    customer_detail.phone_number AS cst_contact,
    customer_detail.no_of_tickets AS cst_totalTicket,
    customer_detail.total_price AS cst_chargespaid
    FROM 
    customer_detail
    LEFT JOIN 
    event ON customer_detail.event_id = event.id
    LEFT JOIN 
    user ON user.id = event.user_id
    WHERE 
    customer_detail.customer_id = ?`;

exports.updateEventFreeTicketQuantity = `update event set totalTicketInFreeEvent = ? where id= ?;`;

exports.updateCustomerPresenceInEvent = `update customer_detail set presence = ? where customer_id = ?`;

exports.countEventTicketPurchaser = `SELECT COUNT(*) AS customerCount FROM 
  customer_detail WHERE event_id = ? AND payment_status = TRUE`;

exports.insertContactDetails = `INSERT INTO contact_us (name,email,message) Values(?);`;

exports.insertUserStripeDetails = `INSERT INTO userStripeInfo (stripe_secret_key, publish_key,
      userid, createdAt, updatedAt) VALUES (?,?,?,?,?)`;

exports.updateUserStripeDetails = `UPDATE userStripeInfo SET stripe_secret_key = ?,
    publish_key = ?, updatedAt = ${utc} WHERE userid = ?;`;

exports.userStripeDetails = `select id,stripe_secret_key,publish_key,createdAt,updatedAt from userStripeInfo where userid = ?`;

exports.insertNewSubscription = `insert into Subscription_Available (title, description, image, cost, frequency,
      stripe_price_id,stripe_product_id, stripe_product_name) values(?)`;

exports.updateAvailableSubscription = (image) => {
    return `update Subscription_Available set title = ?, description= ?, image='${
    image ? image : null
  }',
    cost= ?, frequency=?, stripe_price_id= ?,stripe_product_id= ?,
    stripe_product_name= ? where id= ?`;
}

exports.deleteAvailableSubscription = `DELETE from Subscription_Available where id = ?`;

exports.getAvailableSubscriptionById = `SELECT id,title,description,image,cost,frequency,stripe_price_id,
stripe_product_id,stripe_product_name, costNZ from Subscription_Available where id = ?`;

exports.getAllAvailableSubscription = `SELECT * from Subscription_Available`;

exports.customerTicketDetailById = `SELECT customer_id, first_name, last_name, email, phone_number, event_id,
  event.title, ticket_id, no_of_tickets, customer_detail.total_price, presence, dateTicketBookedfor,
  DATE_FORMAT(FROM_UNIXTIME(customer_detail.payment_datetime), '%Y-%m-%dT%h:%i:%s %p') AS paymentTime,
  JSON_ARRAYAGG(
      JSON_OBJECT(
          'label', label,
          'ticketbooked', customerTicketDetails.totalTicket,
          'totalChargespaid', customerTicketDetails.totalPrice,
          'perTicketPrice', ROUND(customerTicketDetails.totalPrice/customerTicketDetails.totalTicket, 2),
          'currency', eventTicketPrice.currency
      )
  ) AS ticketDetails
  FROM customer_detail
  LEFT JOIN event ON customer_detail.event_id = event.id 
  LEFT JOIN customerTicketDetails ON customer_detail.customer_id = customerTicketDetails.customerId
  LEFT JOIN eventTicketPrice ON eventTicketPrice.stripePriceId = customerTicketDetails.stripePriceId
  WHERE customer_detail.customer_id = ?
  GROUP BY customer_id, first_name, last_name, email, phone_number, event_id, ticket_id, no_of_tickets,
  customer_detail.total_price, presence, paymentTime`;

exports.getEventCustomerByIdAndPresenceStatus = `SELECT customer_id, first_name, last_name, email,phone_number, event_id, 
  event.title, ticket_id, no_of_tickets, customer_detail.total_price, presence, dateTicketBookedfor,
  DATE_FORMAT(FROM_UNIXTIME(customer_detail.payment_datetime), '%Y-%m-%dT%h:%i:%s %p') AS paymentTime,
  JSON_ARRAYAGG(
  JSON_OBJECT(
      'label', label,
      'ticketbooked', customerTicketDetails.totalTicket,
      'totalChargespaid', customerTicketDetails.totalPrice,
      'perTicketPrice', ROUND(customerTicketDetails.totalPrice/customerTicketDetails.totalTicket, 2),
      'currency', eventTicketPrice.currency
  )
  ) AS ticketDetails
  FROM customer_detail
  LEFT JOIN event ON customer_detail.event_id = event.id 
  LEFT JOIN customerTicketDetails ON customer_detail.customer_id = customerTicketDetails.customerId
  LEFT JOIN eventTicketPrice ON eventTicketPrice.stripePriceId = customerTicketDetails.stripePriceId
  WHERE customer_detail.event_id = ? AND presence = ?
  GROUP BY customer_id, first_name, last_name, email, phone_number, event_id, ticket_id, no_of_tickets,
  customer_detail.total_price, presence, paymentTime
  limit ? offset ?`

  exports.getEventCustomerPresenceInEvent = `SELECT customer_id, first_name, last_name, email, phone_number, event_id, 
  ticket_id, no_of_tickets, customer_detail.total_price, presence, dateTicketBookedfor,
  DATE_FORMAT(FROM_UNIXTIME(customer_detail.payment_datetime), '%Y-%m-%dT%h:%i:%s %p') AS paymentTime,
  JSON_ARRAYAGG(
  JSON_OBJECT(
      'label', label,
      'ticketbooked', customerTicketDetails.totalTicket,
      'totalChargespaid', customerTicketDetails.totalPrice,
      'perTicketPrice', ROUND(customerTicketDetails.totalPrice/customerTicketDetails.totalTicket, 2),
      'currency', eventTicketPrice.currency
  )
  ) AS ticketDetails
  FROM customer_detail
  LEFT JOIN event ON customer_detail.event_id = event.id 
  LEFT JOIN customerTicketDetails ON customer_detail.customer_id = customerTicketDetails.customerId
  LEFT JOIN eventTicketPrice ON eventTicketPrice.stripePriceId = customerTicketDetails.stripePriceId
  WHERE customer_detail.event_id = ? AND payment_status = ${true}
  GROUP BY customer_id, first_name, last_name, email, phone_number, event_id, ticket_id, no_of_tickets,
  customer_detail.total_price, presence, paymentTime
  limit ? offset ?`