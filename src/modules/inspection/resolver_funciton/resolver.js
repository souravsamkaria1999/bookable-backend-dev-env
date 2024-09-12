const { reraConn } = require("../../../dbconfig");
const {
  hashedPassword,
  compareDates,
  getDates,
} = require("../../../sharedMethod/sharedMethod");

const inspectionService = require("../services/inspectionService");

exports.registerUser = async (_, args,context) => {
  try {
    const userId = await inspectionService.register({args,context});
    return userId;
  } catch (error) {
    throw new Error(error);
  }
};

exports.userLogin = async (_, args) => {
  try {
    const loginData = await inspectionService.login(args);
    return loginData;
  } catch (error) {
    throw error;
  }
};

exports.updateEmailValidation = async(_,args) => {
  try {
    const emailValidation = await inspectionService.updateEmailValidation(args);
    return emailValidation;    
  } catch (error) {
    throw error;
  }
}

exports.getAllUsersData = async () => {
  const users = await new Promise(async (resolve, reject) => {
    const userQuery = `SELECT user.id AS userId, user.token, subscription.serviceType FROM user LEFT JOIN subscription ON user.id = subscription.userId`;
    reraConn.query(userQuery, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
  return users;
};
exports.checkTrialPeriod = async (userId, service) => {
  const sqlQuery =
    "SELECT expiryDate FROM subscription WHERE userId = ? AND serviceType = ?";
  const sqlValues = [userId, service];

  const getExpiryDate = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery, sqlValues, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  if (getExpiryDate.length > 0) {
    const startDate = getDates().currentDate;
    const expiryDate = new Date(getExpiryDate[0].expiryDate);

    const formattedExpiryDate = expiryDate.toISOString().slice(0, 10);

    const compare = await compareDates(startDate, formattedExpiryDate);

    if (compare == false) {
      let sqlQuery;
      if (service == "rera") {
        sqlQuery = `UPDATE user SET reraAccess = false WHERE id = ${userId}`;
      } else {
        sqlQuery = `UPDATE user SET inspectionApiAccess = false WHERE id = ${userId}`;
      }
      await new Promise((resolve, reject) => {
        reraConn.query(sqlQuery, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    }
  }
};

exports.createInspection = async (_, args, context) => {
  const token = context.token;
  return await inspectionService.setInspectionTimings({ args, token });
};

exports.getInspections = async (_, args) => {
  return await inspectionService.getInspectionTimings(args);
};

exports.platformBrokerRegister = async (_, args) => {
  try {
    const { name, email, password, platformId } = args;
    const hashedPass = await hashedPassword(password);
    const sqlValues = [[name, email, hashedPass, platformId]];

    const sqlQuery =
      "INSERT INTO platformBroker (name,email,password,platform) VALUES ?";

    const registerBroker = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, [sqlValues], (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    return registerBroker;
  } catch (error) {
    throw new Error(error);
  }
};
exports.addSlot = async (_, args, context) => {
  const token = context.token;
  const data = await inspectionService.addSlot({ args, token });
  return data;
};

exports.deleteSlot = async (_, args, context) => {
  const token = context.token;
  const data = await inspectionService.deleteSlot({ args, token });
  return data;
};

exports.sendOTPEmail = async (_, args,context) => {
  const sendOTP = await inspectionService.sendOTPEmailToInspectionerUser({args,context});
  return sendOTP;
}

exports.verifyEmailOTP = async (_, args) => {
  const verifyOTP = await inspectionService.validateInspectionerEmailOTP({args});
  return verifyOTP;
}

exports.bookInspection = async (_, args, context) => {
  const token = context.token;
  const data = await inspectionService.inspectionBooking({
    args,
    token,
  });
  return data;
};

exports.getVisitingUsers = async (_, args, context) => {
  const token = context.token;

  const data = await inspectionService.listClients({
    args,
    token,
  });

  return data;
};

exports.banClients = async (_, args, context) => {
  const token = context.token;

  const data = await inspectionService.banClients({ args, token });

  return data;
};
exports.platformBrokerLogin = async (_, args) => {
  const { email, password } = args;
};
