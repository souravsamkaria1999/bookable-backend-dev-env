const reraDataService = require("../service/rera-data-service");

exports.createData = async (_, args, context) => {
  const token = context.token;
  const data = await reraDataService.insertStateWiseData({ args, token });
  return data;
};
exports.getStateWiseData = async (_, args, context) => {
  const token = context.token;
  const data = await reraDataService.get_stateWise_data({ args, token });
  return data;
};

exports.getAgentByNameAndReraNum = async (_, args, context) => {
  const token = context.token;
  const data =
    await reraDataService.getAgentsDataByState_name_certificate_number({
      args,
      token,
    });
  return data;
};

exports.deleteAgentById = async (_, args, context) => {
  const token = context.token;
  const deleteAgent = await reraDataService.removeAgentData({ args, token });
  return deleteAgent;
};

exports.editAgentStateWise = async (_, args, context) => {
  const token = context.token;
  const agent = await reraDataService.editAgentStateWise({ args, token });
  return agent;
};
