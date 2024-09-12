const shared = require("../../../sharedMethod/sharedMethod");
const { reraConn } = require("../../../dbconfig");
const ShortUniqueId = require("short-unique-id");
const uuid = new ShortUniqueId({ length: 8 });

const { transporter } = require("../../../sharedMethod/emailVerify");

exports.runTest = async (req, res) => {
  const { headers, params, body } = req;

  const token = headers.authorization;

  const verifyUserToken = await shared.tokenVerification(token);
  if (verifyUserToken.valid == true) {
    res.json({
      token: token,
      params: params,
      body: body,
    });
  } else {
    res.status(498).json({
      status: "failed",
      message: verifyUserToken.error,
    });
  }
};

exports.register = async (req, res) => {
  const body = req.body ? req.body : req.args;
  const {
    name,
    email,
    password,
    phoneNumber,
    userName,
    reraAccess,
    inspectionApiAccess,
  } = body;

  const hashedPass = await shared.hashedPassword(password);
  const sqlValues = [
    [
      name,
      email,
      hashedPass,
      phoneNumber,
      userName,
      reraAccess,
      inspectionApiAccess,
    ],
  ];

  const sqlQuery =
    "INSERT INTO user (name,email,password,phoneNumber,userName, reraAccess, inspectionApiAccess) VALUES ?";

  const register = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery, [sqlValues], (err, result) => {
      if (err) {
        res?.json({
          status: "failed",
          code: err.code,
          message: err.sqlMessage,
        });
        reject(err.sqlMessage);
      } else {
        resolve(result.insertId);
      }
    });
  });
  const access = {};

  if (reraAccess !== undefined) {
    access.reraAccess = reraAccess;
  }

  if (inspectionApiAccess !== undefined) {
    access.inspectionApiAccess = inspectionApiAccess;
  }

  if (access.length != 0) {
    this.createSubscription(register, access);
  }
  const uid = uuid.rnd().toUpperCase();
  const updateuuid = `update user set uuid = ? where id = ${register}`;
  await new Promise((resolve, reject) => {
    reraConn.query(updateuuid, uid, (err, result) => {
      if (err) {
        res?.json({
          status: "failed",
          code: err.code,
          message: err.sqlMessage,
        });
        reject(err.sqlMessage);
        return err.sqlMessage;
      } else {
        resolve(result.insertId);
      }
    });
  });
  const origin = req.context.origin;
  const mailingData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: process.env.VERIFICATION,
    template: "userEmailVerify",
    context: {
      token: uid,
      user_id: register,
      domain:origin,
    },
  };
  transporter.sendMail(mailingData, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent");
    }
  });

  res?.json({ status: "success", id: register });
  return register;
};
exports.createSubscription = async (userId, access) => {
  const dates = shared.getDates();
  const startDate = dates.currentDate;
  const expiryDate = dates.expiryDate;
  const accountType = 1;
  let serviceType;

  if (access.reraAccess && access.inspectionApiAccess) {
    const insertSubscriptionQueryRera =
      "INSERT INTO subscription (userId, startDate, expiryDate, accountType, serviceType) VALUES (?, ?, ?, ?, ?)";
    const insertSubscriptionQueryInspection =
      "INSERT INTO subscription (userId, startDate, expiryDate, accountType, serviceType) VALUES (?, ?, ?, ?, ?)";
    const sqlValuesRera = [userId, startDate, expiryDate, accountType, 1];
    const sqlValuesInspection = [userId, startDate, expiryDate, accountType, 2];

    await Promise.all([
      new Promise((resolve, reject) => {
        reraConn.query(
          insertSubscriptionQueryRera,
          sqlValuesRera,
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
      }),
      new Promise((resolve, reject) => {
        reraConn.query(
          insertSubscriptionQueryInspection,
          sqlValuesInspection,
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
      }),
    ]);
  } else if (access.reraAccess) {
    serviceType = 1;
  } else if (access.inspectionApiAccess) {
    serviceType = 2;
  }

  if (serviceType) {
    const insertSubscriptionQuery =
      "INSERT INTO subscription (userId, startDate, expiryDate, accountType, serviceType) VALUES (?, ?, ?, ?, ?)";
    const sqlValues = [userId, startDate, expiryDate, accountType, serviceType];

    await new Promise((resolve, reject) => {
      reraConn.query(insertSubscriptionQuery, sqlValues, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
};

exports.login = async (req, res) => {
  const body = req.body ? req.body : req;
  const { email, password } = body;

  const sqlQuery = `SELECT user.*, usi.userid, 
  COUNT(CASE WHEN ev.publish = true THEN ev.id END) AS live_event,
  COUNT(CASE WHEN ev.publish = false THEN ev.id END) AS draft_event,
  COUNT(ev.id) AS total_event FROM user 
  LEFT JOIN userStripeInfo AS usi ON user.id = usi.userid
  LEFT JOIN event AS ev ON user.id = ev.user_id 
  WHERE user.email = ?`;
  const user = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery, [email], (err, result) => {
      if (err) {
        res?.json({
          status: "failed",
          code: err.code,
          message: err.sqlMessage,
        });
        reject(err);
      } else {
        if ((result && result[0].id == null) || result.length <= 0) {
          resolve(new Error("email does not exists"));
        } else {
          resolve(result[0]);
        }
      }
    });
  });

  if (!(user instanceof Error)) {
    const hashedPass = user.password;

    let onBoardingStep = user.onBoardingStep;
    onBoardingStep++;

    if (onBoardingStep > 1) {
      const checkUserEmailValidation = await new Promise((resolve, reject) => {
        const sqlQuery = `SELECT emailValidate FROM user WHERE id = ${user.id}`;
        reraConn.query(sqlQuery, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result[0].emailValidate);
          }
        });
      });

      if (checkUserEmailValidation == false) {
        return new Error("You must validate yourself from your emailId");
      }
    }
    const compare = await shared.comparePassword(password, hashedPass);

    if (compare) {
      const token = shared.generateToken(user.id, user.name);

      const updateToken = `UPDATE user SET token = '${token}' WHERE id = ${user.id}`;
      reraConn.query(updateToken);

      const updateOnBoardingStep = `UPDATE user SET onBoardingStep = ${onBoardingStep} WHERE id = ${user.id}`;
      reraConn.query(updateOnBoardingStep);

      const response = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          onBoardingStep: onBoardingStep,
        },
        token: token,
        access: {
          reraAccess: user.reraAccess,
          inspectionApiAccess: user.inspectionApiAccess,
        },
        stripeKeys: user.userid ? true : false,
        totalEvent: user.total_event ?? 0,
        liveEvent: user.live_event ?? 0,
        draftEvent: user.draft_event ?? 0,
      };
      res?.json({ status: "success", data: response });
      return response;
    } else {
      res?.json({
        status: "failed",
        message: "Invalid Password",
      });
      return new Error("Invalid Password");
    }
  } else {
    res?.json({
      status: "failed",
      message: user,
    });
    return user;
  }
};

exports.updateEmailValidation = async (req, res) => {
  const { uid, userId, emailValidate } = req.body || req;

  const updateEmailValidation = await new Promise((resolve, reject) => {
    const sqlQuery = `UPDATE user set emailValidate = ${emailValidate} WHERE uuid = "${uid}" AND id = ${userId}`;

    reraConn.query(sqlQuery, (error, result) => {
      if (result.affectedRows == 0) {
        resolve(new Error("wrong credentials"));
      } else {
        resolve(result.protocol41);
      }
    });
  });
  if (!(updateEmailValidation instanceof Error)) {
    const newUUID = uuid.rnd().toUpperCase();
    const updateNewUuid = `update user set uuid = ? where id = ${userId}`;
    reraConn.query(updateNewUuid, newUUID);
  }
  return updateEmailValidation;
};

exports.setInspectionTimings = async (req, res) => {
  const token = req.token ? req.token : req.headers.authorization;

  const verifyToken = await shared.tokenVerification(token);
  if (verifyToken.valid == true) {
    const body = req.body ? req.body : req.args;

    const { userId, entityId, slots, date } = body;

    const checkIfInpection = await this.getInspectionTimings(body);
    if (checkIfInpection.length != 0) {
      const message =
        "cannot create another inspection for this entity for same date";
      res?.json({
        status: "failed",
        message: message,
      });
      return new Error(message);
    } else {
      const sqlQuery =
        "INSERT INTO inspectionTimings (userId, entityId, date) VALUES ?";
      const sqlValues = [[userId, entityId, date]];
      const inspection = await new Promise((resolve, reject) => {
        reraConn.query(sqlQuery, [sqlValues], (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length == 0) {
              resolve(false);
            } else {
              resolve(res);
            }
          }
        });
      });

      const slotPromises = slots.map(async (slot) => {
        const { from, numberOfPeople, to } = slot;
        const fromTime = shared.convert12hrTo24hr(from);
        const tillTime = shared.convert12hrTo24hr(to);
        const slotsQuery =
          "INSERT INTO inspectionSlots (inspectionId, `from`, `to`, numberOfPeople, TotalCapacity ) VALUES ?";
        const slotsValues = [
          [
            inspection.insertId,
            fromTime,
            tillTime,
            numberOfPeople,
            numberOfPeople,
          ],
        ];

        return new Promise((resolve, reject) => {
          reraConn.query(slotsQuery, [slotsValues], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });

      const inspectionSlotsArray = await Promise.all(slotPromises);
      const inspections = await this.getInspectionTimings(body);
      res?.json(inspections);
      return inspections;
    }
  } else {
    throw new Error(verifyToken.error);
  }
};

exports.addSlot = async (req, res) => {
  const body = req.body ? req.body : req.args;
  const token = req.token ? req.token : req.headers.authorization;

  const { inspectionId, from, to, numberOfPeople } = body;
  const fromTime = shared.convert12hrTo24hr(from);
  const tillTime = shared.convert12hrTo24hr(to);

  const verifyToken = await shared.tokenVerification(token);

  if (verifyToken.valid == true) {
    const sqlQuery =
      "INSERT INTO inspectionSlots (inspectionId, `from`, `to`, numberOfPeople,TotalCapacity) VALUES ? ;";
    const sqlValues = [
      [inspectionId, fromTime, tillTime, numberOfPeople, numberOfPeople],
    ];
    const slot = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, [sqlValues], (err, res) => {
        if (err) {
          res?.json({ status: "failed", code: err.code, message: err.message });
          reject(err);
        } else {
          resolve(res.insertId);
        }
      });
    });
    res?.json({ status: "success", data: slot });
    return slot;
  } else {
    throw new Error(verifyToken.error);
  }
};

exports.deleteSlot = async (req, res) => {
  const query = req.query ? req.query : req.args;
  const token = req.token ? req.token : req.headers.authorization;

  const slotId = query.slotId;
  const verifyToken = await shared.tokenVerification(token);

  if (verifyToken.valid == true) {
    const sqlQuery = `DELETE FROM inspectionSlots WHERE id = ${slotId}`;

    const deleteSlot = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, (err, res) => {
        if (err) {
          res?.json({ status: "failed", code: err.code, message: err.message });
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    res?.json({ status: "success", data: deleteSlot });
    return deleteSlot;
  } else {
    throw new Error(verifyToken.error);
  }
};
exports.getInspectionTimings = async (req, res) => {
  const query = req.query ? req.query : req;

  const { userId, entityId, date } = query;
  let sqlQuery;
  let sqlValues;
  if (entityId !== undefined && date !== undefined) {
    sqlQuery =
      "SELECT inspectionTimings.id as inspectionId, inspectionSlots.id as slotId, entityId, DATE_FORMAT(inspectionTimings.`date`, '%Y/%m/%d') as date, TIME_FORMAT(inspectionSlots.from, '%r') AS FromTime, TIME_FORMAT(inspectionSlots.to, '%r') AS ToTime,inspectionSlots.numberOfPeople FROM inspectionTimings LEFT JOIN inspectionSlots ON inspectionTimings.id = inspectionSlots.inspectionId WHERE userId = ? AND entityId = ? AND date = ?";

    sqlValues = [userId, entityId, date];
  } else if (entityId !== undefined) {
    sqlQuery =
      "SELECT inspectionTimings.id as inspectionId, inspectionSlots.id as slotId, entityId, DATE_FORMAT(inspectionTimings.`date`, '%Y/%m/%d') as date, TIME_FORMAT(inspectionSlots.from, '%r') AS FromTime, TIME_FORMAT(inspectionSlots.to, '%r') AS ToTime,inspectionSlots.numberOfPeople FROM inspectionTimings LEFT JOIN inspectionSlots ON inspectionTimings.id = inspectionSlots.inspectionId WHERE userId = ? AND entityId = ?";

    sqlValues = [userId, entityId];
  } else if (date !== undefined) {
    sqlQuery =
      "SELECT inspectionTimings.id as inspectionId, inspectionSlots.id as slotId, entityId, DATE_FORMAT(inspectionTimings.`date`, '%Y/%m/%d') as date, TIME_FORMAT(inspectionSlots.from, '%r') AS FromTime, TIME_FORMAT(inspectionSlots.to, '%r') AS ToTime,inspectionSlots.numberOfPeople FROM inspectionTimings LEFT JOIN inspectionSlots ON inspectionTimings.id = inspectionSlots.inspectionId WHERE userId = ? AND date = ?";

    sqlValues = [userId, date];
  } else {
    sqlQuery =
      "SELECT inspectionTimings.id as inspectionId, inspectionSlots.id as slotId, entityId, DATE_FORMAT(inspectionTimings.`date`, '%Y/%m/%d') as date, TIME_FORMAT(inspectionSlots.from, '%r') AS FromTime, TIME_FORMAT(inspectionSlots.to, '%r') AS ToTime,inspectionSlots.numberOfPeople FROM inspectionTimings LEFT JOIN inspectionSlots ON inspectionTimings.id = inspectionSlots.inspectionId WHERE userId = ?";

    sqlValues = [userId];
  }

  const getInspection = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery, sqlValues, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({ getInspection });
  return getInspection;
};

exports.updateNumberofPeople = async (id, numberOfPeople) => {
  numberOfPeople -= 1;
  const updateSlotQuery = `UPDATE inspectionSlots SET numberOfPeople = ${numberOfPeople} WHERE id = ${id}`;
  reraConn.query(updateSlotQuery);

  const getSlotsQuery = `SELECT numberOfPeople from inspectionSlots WHERE id = ${id}`;

  const peopleLeft = await new Promise((resolve, reject) => {
    reraConn.query(getSlotsQuery, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });
  return peopleLeft;
};

exports.sendOTPEmailToInspectionerUser = async (req, res) => {
  const body = req.args ? req.args : req.body;
  const { email } = body;

  const query = "INSERT INTO inspectionerUser ( email, emailOTP) VALUES (?,?)";

  const min = Math.pow(10, 4);
  const max = Math.pow(10, 5) - 1;
  const emailOTP = Math.floor(Math.random() * (max - min + 1)) + min;

  const values = [email, emailOTP];
  const storeEmailOTP = await new Promise((resolve, reject) => {
    reraConn.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
  const origin = req.context.origin;
    const mailingOtp = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Email Verification OTP",
      template: "InspectionerEmailVerify",
      context: {
        otp: emailOTP,
        domain:origin,
      },
    };

    transporter.sendMail(mailingOtp, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email sent");
      }
    });
  
  return storeEmailOTP;
};

exports.validateInspectionerEmailOTP = async (req, res) => {
  const body = req.args ? req.args : req.body;
  const { otp, email } = body;
  const query = `update inspectionerUser set emailValid =${true} where email = '${email}' AND emailOTP = '${otp}'`;
  const emailValidate = await new Promise((resolve, reject) => {
    reraConn.query(query, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result && result.length > 0) {
        resolve(true);
      } else {
        resolve(new Error("invalid crendentials"));
      }
    });
  });
  return emailValidate;
};

exports.inspectionBooking = async (req, res) => {
  const body = req.args ? req.args : req.body;
  const { name, email, phoneNumber, entityId, slotId } = body;

  const getSlotsQuery = `SELECT numberOfPeople from inspectionSlots WHERE id = ${slotId}`;

  const numberOfPeople = await new Promise((resolve, reject) => {
    reraConn.query(getSlotsQuery, (error, result) => {
      if (error) {
        reject(error);
      }
      if (result && result[0].numberOfPeople > 0) {
        resolve(result[0].numberOfPeople);
      } else {
        resolve(
          new Error(
            "Currently, slots are not available. Please try again later"
          )
        );
      }
    });
  });

  if (numberOfPeople instanceof Error) {
    return numberOfPeople;
  }

  const sqlQuery =
    "INSERT INTO inspectionBookingUser (name, email, phoneNumber, entityId, slotId) VALUES (?,?,?,?,?)";

  const sqlValues = [name, email, phoneNumber, entityId, slotId];
  const inspectionBookingUser = await new Promise((resolve, reject) => {
    reraConn.query(sqlQuery, sqlValues, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result && result.insertId > 0) {
        resolve(result.insertId);
      } else {
        reject(new Error("something went wrong"));
      }
    });
  });

  if (inspectionBookingUser instanceof Error) {
    return inspectionBookingUser;
  }

  const updatedNumberofPeople = await this.updateNumberofPeople(
    slotId,
    numberOfPeople
  );
  res?.json({
    status: "success",
    data: updatedNumberofPeople,
  });
  return updatedNumberofPeople;
};

exports.listClients = async (req, res) => {
  const query = req.args ? req.args : req.query;

  const { brokerId } = query;

  const token = req.token ? req.token : req.headers.authorization;
  const verifyToken = await shared.tokenVerification(token);

  if (verifyToken.valid == true) {
    const sqlQuery = `SELECT ibku.id,ibku.name, ibku.phoneNumber, ibku.entityId,TIME_FORMAT(slot.from, '%r') AS FromTime, TIME_FORMAT(slot.to, '%r') AS ToTime FROM inspectionBookingUser ibku LEFT JOIN inspectionSlots slot ON ibku.slotId = slot.id LEFT JOIN inspectionTimings t ON t.id = slot.inspectionId WHERE t.userId = ${brokerId}`;

    const visitors = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, (error, result) => {
        if (error) {
          res?.json({
            status: "failed",
            code: error.code,
            message: error.sqlMessage,
          });
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    res?.json({
      status: "success",
      data: visitors,
    });
    return visitors;
  } else {
    throw new Error(verifyToken.error);
  }
};

exports.banClients = async (req, res) => {
  const query = req.args ? req.args : req.query;

  const { visitorId } = query;

  const token = req.token ? req.token : req.headers.authorization;

  const tokenVerification = await shared.tokenVerification(token);

  if (tokenVerification.valid == true) {
    const sqlQuery = `UPDATE inspectionBookingUser SET isBanned = true WHERE id = ${visitorId}`;

    const banClients = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, (error, result) => {
        if (error) {
          res?.json({
            status: "failed",
            data: {
              code: error.code,
              message: error.sqlMessage,
            },
          });
          reject(error);
        } else {
          resolve(result.protocol41);
        }
      });
    });
    res?.json({
      status: "success",
      data: banClients,
    });
    return banClients;
  } else {
    throw new Error(tokenVerification.error);
  }
};
