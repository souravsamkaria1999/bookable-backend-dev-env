const inspectionTypeDefs = `
scalar Date
scalar JSON
scalar Bigint
enum ServiceType{
  rera
  inspection
  events
}
type user{
    id: Int!                 
    name: String!                  
    email: String! 
    userRole: String                
    phoneNumber: String!
    onBoardingStep: Int!
   }
   type platformBroker{
    brokerId: Int!                 
    name: String!                  
    email: String!   
    password: String!              
    user: user!
  }
  type inspectionSlots{
    inspectionId: Int
    from: String
    to: String
    numberOfPeople: Int
  }
   type accessStatus{
    reraAccess: Boolean
    inspectionApiAccess: Boolean
   }
   type auth {
     user: user
     token: String
     access: accessStatus
     stripeKeys:Boolean
     totalEvent:Int
     liveEvent:Int
     draftEvent:Int
   }
   type getInspectionSlots{
    slotId: Int
    entityId: String
    date: String
    FromTime: String
    ToTime: String
    numberOfPeople: Int
   }
   type numberOfPeopleLeft{
    numberOfPeople: Int!
   }
   type visitingUsers{
    name: String!
    email: String!
    phone: Bigint!
   }
   type visitingUsersList{
    id: Int!
    name: String!
    phoneNumber: String!
    entityId: String!
    FromTime: String!
    ToTime: String!
   }

     type Query{
       getInspectionTimings(userId:Int!, date: String, entityId: String): [getInspectionSlots]
       deleteSlot(slotId: Int!): Boolean
       getVisitingUsers(brokerId: Int!): [visitingUsersList!]!
     }

     type Mutation{

      Ins_sendOTPEmail(
        email: String!
      ): Int

      Ins_verifyEmailOTP(
        otp: String!
        email: String!
      ): Boolean

        userRegistration(
          name: String!                  
          email: String!                 
          password: String!              
          userName:String!
          phoneNumber:String!
          reraAccess: Boolean
          inspectionApiAccess: Boolean
        ): Int

        userLogin(
          email: String!
          password: String!
        ): auth

        updateEmailValidation(
          uid: String!
          userId: Int!
          emailValidate: Boolean!
        ): Boolean!

        createInspectionTimings(
          userId: Int!
          entityId: String!
          date: String!
          slots: [InspectionSlotsInput]
        ): [getInspectionSlots]

        addSlot(
          inspectionId: Int!
          from: String!
          to: String!
          numberOfPeople: Int!
        ): Int!

        bookInspection(
          name: String!
          email : String !
          phoneNumber: Bigint!
          entityId: String!
          slotId: Int!
        ): numberOfPeopleLeft!

        banClients(
          visitorId: Int!
        ): Boolean!
      }
      
      input InspectionSlotsInput {
        from: String!
        to: String!
        numberOfPeople: Int!
      }`;

module.exports = inspectionTypeDefs;
