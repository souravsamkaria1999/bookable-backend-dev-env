const reraDataTypeDef = `
type pbReraData {
    id: Int!
    agent_name: String!
    district: String!
    registration_certificate_num: String!
    certificate_expiry_date: String!
    }
  type hrReraData {
    id: Int!
    agent_name: String!
    district: String!
    category: String
    registration_certificate_num: String!
    certificate_issue_date: String
    certificate_expiry_date: String!
  }
  type stateWiseData {
    id: Int!
    agent_name: String!
    district: String
    registration_certificate_num: String!
    certificate_issue_date: String
    certificate_expiry_date: String
    type_of_registeration: String
    contact_number: String
    emailAddress: String
    status: Boolean
  }
  type reraAgent {
    id: Int
    district: String
    agent_name: String!
    registration_certificate_num: String!
    status: Boolean!
  }
  type Query{
    getStateWiseData(state:String!, id: Int): [stateWiseData!]
    getAgentBy_name_and_certificateNumber(name: String, state: String!,registration_certificate_num: String): [reraAgent!]
    deleteAgent(state: String!,agentId: Int!): Boolean!
  }
  type Mutation {
    createStateWiseData(
      state: String!
      agent_name: String!
      district: String
      registration_certificate_num: String!
      certificate_issue_date: String
      certificate_expiry_date: String
      type_of_registeration: String
      contact_number: String
      emailAddress: String
      status: Boolean!
    ): Int 
    updateAgentStateWise(
      id: Int!
      state: String!
      agent_name: String!
      district: String
      registration_certificate_num: String!
      certificate_issue_date: String
      certificate_expiry_date: String
      type_of_registeration: String
      contact_number: String
      emailAddress: String
      status: Boolean!
    ): reraAgent!
  }`;
module.exports = reraDataTypeDef;
