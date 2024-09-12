const bcrypt = require("bcrypt");
const { reraConn } = require("../dbconfig");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const { transporter } = require("./emailVerify");


exports.hashedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    throw err;
  }
};

exports.comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(
      plainPassword.toString(),
      hashedPassword
    );
    return isMatch;
  } catch (error) {
    throw error;
  }
};

exports.checkSpelling = (state) => {
  const states = ["punjab", "haryana", "goa"];
  if (!states.includes(state)) {
    throw new Error(
      "No data related to the state. Search for another state or check spelling"
    );
  } else {
    return state;
  }
};

exports.verifyBrokerCertificateNum = async (state, certificateNum) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM ${state}_rera WHERE registration_certificate_num = ?`;
    reraConn.query(sqlQuery, certificateNum, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length > 0);
      }
    });
  });
};

exports.generateTokenForRealEstate = (id, name) => {
  return jwt.sign(
    { id: id, name: name },
    process.env.JWT_SECRET_FOR_REAL_ESTATE,
    {
      expiresIn: "1 days",
    }
  );
};

exports.tokenVerificationForRealEstate = (token) => {
  const authToken = token.substring("Bearer ".length);

  return new Promise((resolve, reject) => {
    jwt.verify(
      authToken,
      process.env.JWT_SECRET_FOR_REAL_ESTATE,
      (err, decoded) => {
        if (err) {
          resolve({ valid: false, error: err });
        } else {
          resolve({ valid: true, data: decoded });
        }
      }
    );
  });
};
exports.generateToken = (id, name) => {
  return jwt.sign({ id: id, name: name }, process.env.JWT_SECRET, {
    expiresIn: "1 days",
  });
};
exports.tokenVerification = (token) => {
  const authToken = token.substring("Bearer ".length);
  return new Promise((resolve, reject) => {
    jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        resolve({ valid: false, error: err });
      } else {
        resolve({ valid: true, data: decoded });
      }
    });
  });
};

exports.getDates = () => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const formattedCurrentDate = String(`${year}-${month}-${day}`);

  const futureDate = new Date(currentDate);
  futureDate.setDate(currentDate.getDate() + 10);

  const futureYear = futureDate.getFullYear();
  const futureMonth = String(futureDate.getMonth() + 1);
  const futureDay = String(futureDate.getDate());

  const futureFormattedDate = `${futureYear}-${futureMonth}-${futureDay}`;
  return { currentDate: formattedCurrentDate, expiryDate: futureFormattedDate };
};

exports.compareDates = (current, expiresIn) => {
  return new Promise((resolve, reject) => {
    const currentEpoch = new Date(current).getTime();
    const expiryEpoch = new Date(expiresIn).getTime();
    if (currentEpoch < expiryEpoch) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

exports.convert12hrTo24hr = (time12hr) => {
  const [time, period] = time12hr.split(" ");
  const [hours, minutes] = time.split(":");

  let formattedHours = parseInt(hours, 10);

  if (period === "PM" && formattedHours !== 12) {
    formattedHours += 12;
  } else if (period === "AM" && formattedHours === 12) {
    formattedHours = 0;
  }

  return `${formattedHours.toString().padStart(2, "0")}:${minutes}`;
};

exports.toSendTicketDetailsEmailByEventOwner = async(req,res) => {

  const { cst_Name,ticketId,eventName, email,ticketDetails,organizerName } = req.body || req.args;
    const origin = req.context.origin;

    const userTicketDetails = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Confirmation of Event Ticket Booking',
      template: 'customerEventTicketDetails',
      context: {
        cst_Name: cst_Name,
        eventName: eventName,
        ticketId: ticketId,
        ticketDetails:ticketDetails,
        organizer: organizerName,
        domain: origin,
      }
    };
  transporter.sendMail(userTicketDetails, function (error, sucess) {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent");
    }
  });
  return "email sent"
}

exports.checkUserSubscription = async(userId) => {
  const currentDay = Math.floor(new Date().getTime() / 1000);
const query = `SELECT ss.*, sa.title FROM Subscription_subscribed as ss LEFT JOIN
Subscription_Available as sa ON ss.plan_choosen = sa.id WHERE ss.user_id = ${userId}
AND status = 'active'`;

const purchased= await new Promise ((resolve,reject) => {
  reraConn.query(query,(err,result) => {
    if(err){
      reject(err)
    }
    if(result && result.length > 0){
      resolve(result[0]);
    }else{
      resolve(false);
    }
  });
});

return purchased;
}

exports.userPublishedEvent = async(userId) =>{

  const userEventCountQuery = `SELECT COUNT(*) AS eventCount
  FROM event
  WHERE user_id = ${userId}
  AND publish = ${true}
  AND createdAt >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01 00:00:00')
  AND createdAt <= LAST_DAY(CURRENT_DATE()) + INTERVAL 1 DAY - INTERVAL 1 SECOND;`

  const userEventCountResult = new Promise((resolve,reject) => {
    reraConn.query(userEventCountQuery, (err,result) => {
      if(err){
        reject(err);
      }
      if(result && result.length > 0 && result[0].eventCount > 0){
        resolve( result[0].eventCount );
      } else {
        resolve(0);
      }
    });
  });
  return userEventCountResult;
}

exports.checkCustomerTicketExist = async(customerId) => {
  const query = `SELECT cd.ticket_id as ticketId from customer_detail as cd
   where cd.customer_id = ${customerId}`;

  const customerTicketDetails = await new Promise((resolve, reject) => {
    reraConn.query(query, (err, result) => {
      if (err) {
        resolve(false);
      }
      if (result && result.length > 0 && result[0].ticketId != null) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
  return customerTicketDetails;
}

exports.checkEventTicket = async(stripePriceId) => {
  const query = `SELECT EXISTS (
    SELECT 1
    FROM eventTicketPrice 
    WHERE stripePriceId = '${stripePriceId}' 
    AND ticketQuantity > 0
) AS ticketQuantityGreaterThanZero`;

  const eventTicket = await new Promise((resolve, reject) => {
    reraConn.query(query, (err, result) => {
      if (err) {
        resolve(false);
      }
      if (result && result[0].ticketQuantityGreaterThanZero > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
  return eventTicket;
}
