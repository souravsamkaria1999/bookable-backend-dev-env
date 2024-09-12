const { conn } = require("../../../dbconfig");
const shared = require("../../../sharedMethod/sharedMethod");

exports.realEstateUserRegister = async (req, res) => {
  const body = req.body ? req.body : req;
  const {
    first_name,
    last_name,
    phone_num,
    email,
    user_name,
    password,
    role,
    state,
    district,
    reraCertificateNum,
  } = body;
  const sqlQuery =
    "INSERT INTO user (first_name, last_name, phone_num, email, user_name, password, role) VALUES ?";
  const hashedPass = await shared.hashedPassword(password);
  const userValue = [
    [first_name, last_name, phone_num, email, user_name, hashedPass, role],
  ];

  if (role === "broker") {
    const stateName = shared.checkSpelling(state.toLowerCase());

    const verifyCertificate = await shared.verifyBrokerCertificateNum(
      stateName,
      reraCertificateNum
    );

    let reraVerified;
    if (verifyCertificate) {
      reraVerified = true;
    } else {
      reraVerified = false;
    }
    const userInsert = await new Promise((resolve, reject) => {
      conn.query(sqlQuery, [userValue], (err, result) => {
        if (err) {
          res?.json({
            status: "failed",
            code: err.code,
            message: err.sqlMessage,
          });
          reject(err);
        } else {
          resolve(result.insertId);
        }
      });
    });

    const brokerQuery =
      "INSERT INTO broker (state, district, reraVerified, reraCertificateNum, user_id) VALUES ?";
    const brokerData = [
      [state, district, reraVerified, reraCertificateNum, userInsert],
    ];

    const brokerInsert = await new Promise((resolve, reject) => {
      conn.query(brokerQuery, [brokerData], (error, result) => {
        if (error) {
          res?.json({
            status: "failed",
            code: err.code,
            message: err.sqlMessage,
          });
          reject(error);
        } else {
          resolve(result.insertId);
        }
      });
    });
    res?.json({
      status: "success",
      user_id: userInsert,
    });
    return userInsert;
  } else {
    const userInsert = await new Promise((resolve, reject) => {
      conn.query(sqlQuery, [userValue], (err, result) => {
        if (err) {
          res?.json({
            status: "failed",
            code: err.code,
            message: err.sqlMessage,
          });
          reject(err);
        } else {
          resolve(result.insertId);
        }
      });
    });
    res?.json({
      status: "success",
      user_id: userInsert,
    });
    return userInsert;
  }
};

exports.realEstateUserLogin = async (req, res) => {
  const body = req.body ? req.body : req;
  const { email, password } = body;
  const sqlQuery = "SELECT * FROM user WHERE email = ?";

  const user = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, email, (err, result) => {
      if (err) {
        res?.json({
          status: "failed",
          code: err.code,
          message: err.message,
        });
        reject(err);
      }
      resolve(result[0]);
      if (result.length === 0) {
        throw new Error("user with this email not found");
      }
    });
  });

  const hashedPassword = user.password;
  const compare = await shared.comparePassword(password, hashedPassword);

  let response;
  if (compare) {
    const token = shared.generateTokenForRealEstate(user.id, user.first_name);
    if (user.role == "broker") {
      const brokerQuery = `SELECT * FROM broker WHERE user_id = ${user.id}`;
      const broker = await new Promise((resolve, reject) => {
        conn.query(brokerQuery, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result[0]);
          }
        });
      });

      response = {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_num: user.phone_num,
          email: user.email,
          user_name: user.user_name,
          role: user.role,
          broker_id: broker.id,
          state: broker.state,
          district: broker.district,
          reraVerified: broker.reraVerified,
          reraCertificateNum: broker.reraCertificateNum,
        },
        token: token,
      };
      res?.json({
        status: "success",
        data: response,
      });
    } else {
      response = {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_num: user.phone_num,
          email: user.email,
          user_name: user.user_name,
          role: user.role,
        },
        token: token,
      };
      res?.json({
        status: "success",
        data: response,
      });
    }
    return response;
  } else {
    throw new Error("Invalid password");
  }
};

exports.fetchPropertyCategories = async (req, res) => {
  const query = req.query ? req.query : req;

  const categoryId = query.id;
  let sqlQuery;
  if (categoryId == undefined) {
    sqlQuery = "SELECT * from propertyCategory";
  } else {
    sqlQuery = `SELECT * from propertyCategory WHERE id = ${categoryId}`;
  }

  const propertyCategory = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: propertyCategory,
  });
  return propertyCategory;
};

exports.fetchPropertyTypes = async (req, res) => {
  const query = req.query ? req.query : req;

  const typeId = query.id;
  const categoryId = query.categoryId;
  let sqlQuery;
  if (typeId && categoryId) {
    sqlQuery = `SELECT * from propertyType WHERE id = ${typeId} AND propertyCategory = ${categoryId}`;
  } else if (categoryId == undefined) {
    sqlQuery = `SELECT * from propertyType`;
  } else {
    sqlQuery = `SELECT * from propertyType WHERE propertyCategory = ${categoryId}`;
  }

  const propertyType = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: propertyType,
  });
  return propertyType;
};

exports.fetchPropertyAmenities = async (req, res) => {
  const query = req.query ? req.query : req;
  const amentityId = query.id;

  const sqlQuery = amentityId
    ? `SELECT * FROM amenities WHERE id = ${amentityId}`
    : `SELECT * FROM amenities`;

  const amenities = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: amenities,
  });
  return amenities;
};

exports.fetchBhkType = async (req, res) => {
  const query = req.query ? req.query : req;
  const bhkTypeId = query.id;

  const sqlQuery = bhkTypeId
    ? `SELECT * FROM bhkType WHERE id = ${bhkTypeId}`
    : `SELECT * FROM bhkType`;

  const bhkTypes = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: bhkTypes,
  });
  return bhkTypes;
};

exports.fetchListingType = async (req, res) => {
  const query = req.query ? req.query : req;
  const listingTypeId = query.id;

  const sqlQuery = listingTypeId
    ? `SELECT * FROM listingType WHERE id = ${listingTypeId}`
    : `SELECT * FROM listingType`;

  const listingTypes = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: listingTypes,
  });
  return listingTypes;
};

exports.fetchFurnishingType = async (req, res) => {
  const query = req.query ? req.query : req;

  const furnishingTypeId = query.id;

  const sqlQuery = furnishingTypeId
    ? `SELECT * FROM furnishingType WHERE id = ${furnishingTypeId}`
    : `SELECT * FROM furnishingType`;

  const furnishingTypes = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: furnishingTypes,
  });
  return furnishingTypes;
};

exports.fetchMaintenanceType = async (req, res) => {
  const query = req.query ? req.query : req;

  const maintenanceTypeId = query.id;

  const sqlQuery = maintenanceTypeId
    ? `SELECT * FROM maintenanceType WHERE id = ${maintenanceTypeId}`
    : `SELECT * FROM maintenanceType`;

  const maintenanceTypes = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, (error, result) => {
      if (error) {
        res?.json({
          status: "failed",
          code: error.code,
          message: error.message,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  res?.json({
    status: "success",
    data: maintenanceTypes,
  });
  return maintenanceTypes;
};
exports.enterPropertyDetails = async (req, res) => {
  const token = req.headers.authorization;

  const verifyUserToken = await shared.tokenVerificationForRealEstate(token);

  if (verifyUserToken.valid == true) {
    const propertyQuery =
      "INSERT INTO property (`description`, `shortDescription`, `owner`, `available`, `postedBy`) VALUES(?)";
    const propertyVaue = [
      req.body.description,
      req.body.short_description,
      req.body.owner,
      req.body.available,
      verifyUserToken.data.id,
    ];
    conn.query(propertyQuery, [propertyVaue], (err, result) => {
      if (err) {
        res.status(401).json({
          status: "failed",
          message: err.sqlMessage,
        });
      } else {
        res.status(200).json({
          status: "success",
          message: true,
        });
      }
    });
  } else {
    res.status(498).json({
      status: "failed",
      message: verifyUserToken.error,
    });
  }
};

exports.createProperty = async (req, res) => {
  const body = req.body ? req.body : req.args;
  const token = req.token ? req.token : req.headers.authorization;
  const {
    shortDescription,
    description,
    furnishingType,
    propertyType,
    categoryType,
    available,
    ownerName,
    ownerPhoneNumber,
    ownerEmail,
    postedBy,
    size,
    built_up_area_sqft,
    NumberOfBedrooms,
    NumberOfBathrooms,
    carSpace,
    listingType,
    maintenanceType,
    price,
    rent,
    maintenanceCharges,
    amenities,
    bhkType,
    directionFacing,
    numberOfCabins,
    availableFrom,
    availableTill,
    street,
    city,
    state,
    zipCode,
  } = body;

  const verifyUserToken = await shared.tokenVerificationForRealEstate(token);
  if (verifyUserToken.valid == true) {
    const ownerId = await this.CheckandCreateOwner({
      ownerName,
      ownerEmail,
      ownerPhoneNumber,
    });

    const createPropertyQuery =
      "INSERT INTO property (shortDescription, description, owner, furnishingType, categoryType, propertyType, available, postedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const createPropertyValues = [
      shortDescription,
      description,
      ownerId,
      furnishingType,
      categoryType,
      propertyType,
      available,
      postedBy,
    ];
    const propertyId = await new Promise((resolve, reject) => {
      conn.query(createPropertyQuery, createPropertyValues, (error, result) => {
        if (error) {
          res?.json({
            status: "failed",
            code: error.code,
            message: error.message,
          });
          reject(error);
        } else {
          resolve(result.insertId);
        }
      });
    });

    const propertyDetails = await this.addPropertyDetails({
      propertyId,
      size,
      built_up_area_sqft,
      NumberOfBedrooms,
      NumberOfBathrooms,
      carSpace,
      listingType,
      maintenanceType,
      price,
      rent,
      maintenanceCharges,
      amenities,
      bhkType,
      directionFacing,
      numberOfCabins,
      availableFrom,
      availableTill,
    });

    const address = await this.addPropertyAddress({
      propertyId,
      street,
      city,
      state,
      zipCode,
    });

    return propertyId;
  } else {
    throw new Error(verifyUserToken.error);
  }
};

exports.CheckandCreateOwner = async (details) => {
  const { ownerName, ownerEmail, ownerPhoneNumber } = details;

  const checkOwnerQuery = "SELECT id from owner WHERE email = ?";

  const checkOwnerValues = [ownerEmail];

  const existingOwner = await new Promise((resolve, reject) => {
    conn.query(checkOwnerQuery, checkOwnerValues, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  if (existingOwner.length == 0) {
    const sqlQuery =
      "INSERT INTO owner (name, phone_number, email) VALUES (?, ?, ?)";
    const sqlValues = [ownerName, ownerPhoneNumber, ownerEmail];

    const ownerId = await new Promise((resolve, reject) => {
      conn.query(sqlQuery, sqlValues, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.insertId);
        }
      });
    });
    return ownerId;
  } else {
    return existingOwner[0].id;
  }
};

exports.addPropertyDetails = async (details) => {
  const {
    propertyId,
    size,
    built_up_area_sqft,
    NumberOfBedrooms,
    NumberOfBathrooms,
    carSpace,
    listingType,
    maintenanceType,
    price,
    rent,
    maintenanceCharges,
    amenities,
    bhkType,
    directionFacing,
    numberOfCabins,
    availableFrom,
    availableTill,
  } = details;

  const sqlQuery =
    "INSERT INTO propertyDetails (propertyId, size, built_up_area_sqft, NumberOfBedrooms, NumberOfBathrooms, carSpace, listingType, maintenanceType, price, rent, maintenanceCharges, amenities, bhkType, directionFacing, numberOfCabins, availableFrom, availableTill) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  const sqlValues = [
    propertyId,
    size,
    built_up_area_sqft,
    NumberOfBedrooms,
    NumberOfBathrooms,
    carSpace,
    listingType,
    maintenanceType,
    price,
    rent,
    maintenanceCharges,
    amenities,
    bhkType,
    directionFacing,
    numberOfCabins,
    availableFrom,
    availableTill,
  ];

  const propertyDetails = await new Promise((resolve, reject) => {
    conn.query(sqlQuery, sqlValues, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.insertId);
      }
    });
  });
  return propertyDetails;
};

exports.addPropertyAddress = async (details) => {
  const { propertyId, street, city, state, zipCode } = details;

  const addAddressQuery =
    "INSERT INTO address (propertyId, street, city, state, zipCode) VALUES (?,?,?,?,?)";
  const addAddressValues = [propertyId, street, city, state, zipCode];

  const address = await new Promise((resolve, reject) => {
    conn.query(addAddressQuery, addAddressValues, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.insertId);
      }
    });
  });
  return address;
};
