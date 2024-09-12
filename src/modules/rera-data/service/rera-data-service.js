const shared = require("../../../sharedMethod/sharedMethod");
const { reraConn } = require("../../../dbconfig");
const path = require("path");

exports.getLandingPage = async (req, res) => {
  res.render("pages/landing_page");
};

exports.getRegisterPage = async (req, res) => {
  res.render("pages/register_page");
};

exports.getLoginPage = async (req, res) => {
  res.render("pages/login_page");
};

exports.getAgentInfo = async (req, res) => {
  const token = req.headers.authorization;
  res.render("pages/rera_agent_data_search_page",{token: token});
};
exports.insertStateWiseData = async (req, res) => {
  const token = req.token ? req.token : req.headers.authorization;

  const verifyUserToken = await shared.tokenVerification(token);

  if (verifyUserToken.valid == true) {
    const {
      state,
      agent_name,
      district,
      registration_certificate_num,
      certificate_issue_date,
      certificate_expiry_date,
      type_of_registeration,
      contact_number,
      emailAddress,
      status,
    } = req.args ? req.args : req.body;

    const stateName = shared.checkSpelling(state.toLowerCase());

    const sqlQueryForHr =
      "INSERT INTO haryana_rera (agent_name, district, type_of_registeration,registration_certificate_num, certificate_issue_date, certificate_expiry_date, status) VALUES ?";
    const sqlQueryForPb =
      "INSERT INTO punjab_rera (agent_name, district, registration_certificate_num, certificate_expiry_date, status) VALUES ?";
    const sqlQueryForGoa =
      "INSERT INTO goa_rera (agent_name, registration_certificate_num,certificate_issue_date, type_of_registeration, contact_number, emailAddress, status) VALUES ? ";

    const hrValues = [
      [
        agent_name,
        district,
        type_of_registeration,
        registration_certificate_num,
        certificate_issue_date,
        certificate_expiry_date,
        status,
      ],
    ];

    const pbValues = [
      [
        agent_name,
        district,
        registration_certificate_num,
        certificate_expiry_date,
        status,
      ],
    ];

    const goaValues = [
      [
        agent_name,
        registration_certificate_num,
        certificate_issue_date,
        type_of_registeration,
        contact_number,
        emailAddress,
        status,
      ],
    ];

    const sqlQuery =
      stateName == "punjab"
        ? sqlQueryForPb
        : stateName == "haryana"
        ? sqlQueryForHr
        : sqlQueryForGoa;

    const sqlValues =
      stateName == "punjab"
        ? pbValues
        : stateName == "haryana"
        ? hrValues
        : goaValues;

    const agentId = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, [sqlValues], (error, result) => {
        if (error) {
          res?.json({
            status: "failed",
            code: error.code,
            message: error.sqlMessage,
          });
          reject(error);
        } else {
          resolve(result.insertId);
        }
      });
    });
    res?.json({
      status: "success",
      data: agentId,
    });
    return agentId;
  } else {
    return new Error(verifyUserToken.error);
  }
};

exports.get_stateWise_data = async (req, res) => {
  const query = req.args ? req.args : req.query;
  const token = req.token ? req.token : req.headers.authorization;

  const verifyUserToken = await shared.tokenVerification(token);

  if (verifyUserToken.valid == true) {
    const { state, id } = query;
    const stateName = shared.checkSpelling(state.toLowerCase());

    const sqlQuery = id
      ? `SELECT * FROM ${stateName}_rera WHERE id = ${id}`
      : `SELECT * FROM ${stateName}_rera`;
    const stateData = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, (error, result) => {
        if (error) {
          res?.json({
            status: "failed",
            code: error.code,
            message: error.sqlMessage,
          });
          reject(error);
        }
        resolve(result);
      });
    });
    res?.json({
      status: "success",
      data: stateData,
    });
    return stateData;
  } else {
    return new Error(verifyUserToken.error);
  }
};

exports.getAgentsDataByState_name_certificate_number = async (req, res) => {
  const token = req.token ? req.token : req.headers.authorization;

  const verifyUserToken = await shared.tokenVerification(token);

  if (verifyUserToken.valid == true) {
    const { state, name, registration_certificate_num } = req.args
      ? req.args
      : req.query;
    const stateName = shared.checkSpelling(state.toLowerCase());

    const sqlQuery =
      name !== undefined && registration_certificate_num !== undefined
        ? `SELECT * FROM ${stateName}_rera WHERE agent_name = '${name}' AND registration_certificate_num = '${registration_certificate_num}'`
        : name !== undefined
        ? `SELECT * FROM ${stateName}_rera WHERE agent_name = '${name}'`
        : registration_certificate_num !== undefined
        ? `SELECT * FROM ${stateName}_rera WHERE registration_certificate_num = '${registration_certificate_num}'`
        : `SELECT * FROM ${stateName}_rera`;

    const agent = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, (err, result) => {
        if (err) {
          res?.json({
            status: "failed",
            code: err.code,
            message: err.sqlMessage,
          });
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    res?.json({
      status: "success",
      data: agent,
    });
    return agent;
  } else {
    return new Error(verifyUserToken.error);
  }
};

exports.editAgentStateWise = async (req, res) => {
  const token = req.token ? req.token : req.headers.authorization;

  const verifyUserToken = await shared.tokenVerification(token);
  if (verifyUserToken.valid == true) {
    const {
      id,
      state,
      agent_name,
      district,
      registration_certificate_num,
      certificate_issue_date,
      certificate_expiry_date,
      type_of_registeration,
      contact_number,
      emailAddress,
      status,
    } = req.args ? req.args : req.body;

    const stateName = shared.checkSpelling(state.toLowerCase());

    const sqlQueryForHr = `UPDATE haryana_rera SET agent_name = ?, district = ?, type_of_registeration = ?, registration_certificate_num = ?, certificate_issue_date = ?, certificate_expiry_date = ?, status = ? WHERE id = ${id}`;
    const sqlQueryForPb = `UPDATE punjab_rera SET agent_name = ?, district = ?, registration_certificate_num = ?, certificate_expiry_date = ?, status = ? WHERE id = ${id}`;
    const sqlQueryForGoa = `UPDATE goa_rera SET agent_name = ?, registration_certificate_num = ?, certificate_issue_date = ?, type_of_registeration = ?, contact_number = ?, emailAddress = ?, status = ? WHERE id = ${id}`;

    const hrValues = [
      agent_name,
      district,
      type_of_registeration,
      registration_certificate_num,
      certificate_issue_date,
      certificate_expiry_date,
      status,
    ];

    const pbValues = [
      [
        agent_name,
        district,
        registration_certificate_num,
        certificate_expiry_date,
        status,
      ],
    ];

    const goaValues = [
      agent_name,
      registration_certificate_num,
      certificate_issue_date,
      type_of_registeration,
      contact_number,
      emailAddress,
      status,
    ];

    const sqlQuery =
      stateName == "punjab"
        ? sqlQueryForPb
        : stateName == "haryana"
        ? sqlQueryForHr
        : sqlQueryForGoa;

    const sqlValues =
      stateName == "punjab"
        ? pbValues
        : stateName == "haryana"
        ? hrValues
        : goaValues;

    const updatedAgentData = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, sqlValues, (err, result) => {
        if (err) {
          res?.json({
            status: "failed",
            code: err.code,
            message: err.sqlMessage,
          });
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    if (updatedAgentData == true) {
      const args = { id, state };
      const agentData = await this.get_stateWise_data({ args, token });
      res?.json({
        status: "success",
        data: agentData[0],
      });
      return agentData[0];
    }
  } else {
    return new Error(verifyUserToken.error);
  }
};

exports.removeAgentData = async (req, res) => {
  const token = req.token ? req.token : req.headers.authorization;

  const verifyUserToken = await shared.tokenVerification(token);
  if (verifyUserToken.valid == true) {
    const { agentId, state } = req.args ? req.args : req.query;
    const stateName = shared.checkSpelling(state.toLowerCase());
    const sqlQuery = `DELETE FROM ${stateName}_rera WHERE id = ${agentId}`;
    const deleteAgent = await new Promise((resolve, reject) => {
      reraConn.query(sqlQuery, (err, result) => {
        if (err) {
          res?.json({
            status: "failed",
            code: err.code,
            message: err.sqlMessage,
          });
          reject(err);
        } else {
          if (result.affectedRows > 0) {
            resolve(true);
          }
        }
      });
    });
    res?.json({
      status: "success",
      data: deleteAgent,
    });
    return deleteAgent;
  } else {
    return new Error(verifyUserToken.error);
  }
};
