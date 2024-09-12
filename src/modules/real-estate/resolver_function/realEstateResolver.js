const { conn } = require("../../../dbconfig");
const {
  tokenVerificationForRealEstate,
} = require("../../../sharedMethod/sharedMethod");

const realEstateService = require("../services/realEstateService");
exports.register = async (_, args) => {
  const registeredUser = await realEstateService.realEstateUserRegister(args);
  return registeredUser;
};

exports.login = async (_, args) => {
  const loggedInUser = await realEstateService.realEstateUserLogin(args);

  return loggedInUser;
};

exports.getUserByRole = async (_, args, context) => {
  const { id } = args;
  const { token } = context;

  const verifyToken = await tokenVerificationForRealEstate(token);

  if (verifyToken.valid == true) {
    let sqlQuery;

    if (id > 0 && id != null) {
      sqlQuery = `SELECT user.*, user.id AS user_id, broker.id AS broker_id,broker.* FROM user  LEFT JOIN broker ON user.id = broker.user_id WHERE user.id = ${id}`;
    } else {
      sqlQuery = `select user.*,user.id AS user_id, broker.id AS broker_id,broker.* FROM user  LEFT JOIN broker ON user.id = broker.user_id `;
    }
    try {
      const data = await new Promise((resolve, reject) => {
        conn.query(sqlQuery, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error(verifyToken.error);
  }
};

exports.getPropertyCategories = async (_, args) => {
  const data = await realEstateService.fetchPropertyCategories(args);
  return data;
};

exports.getPropertyTypes = async (_, args) => {
  const data = await realEstateService.fetchPropertyTypes(args);
  return data;
};

exports.getPropertyAmenities = async (_, args) => {
  const data = await realEstateService.fetchPropertyAmenities(args);
  return data;
};

exports.getPropertyBhkType = async (_, args) => {
  const data = await realEstateService.fetchBhkType(args);
  return data;
};

exports.getPropertyListingType = async (_, args) => {
  const data = await realEstateService.fetchListingType(args);
  return data;
};

exports.getPropertyFurnishingType = async (_, args) => {
  const data = await realEstateService.fetchFurnishingType(args);
  return data;
};

exports.getPropertyMaintenanceType = async (_, args) => {
  const data = await realEstateService.fetchMaintenanceType(args);
  return data;
};

exports.createProperty = async (_, args, context) => {
  const token = context.token;
  const data = await realEstateService.createProperty({ args, token });
  return data;
};
