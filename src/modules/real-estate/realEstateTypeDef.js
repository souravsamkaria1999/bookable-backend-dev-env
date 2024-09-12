const realEstateTypeDefs = `

scalar Date
scalar JSON
scalar Bigint
type realEstateUser{
  id: Int!
  first_name: String!
  last_name: String!
  phone_num: Bigint!
  email: String!
  user_name: String!
  role: String!
  broker_id: Int
  state: String
  district: String
  reraVerified: Boolean
  reraCertificateNum: String
}
type broker{
  id: Int
  user: user
  state: String
  district: String
  reraVerified: Boolean
  reraCertificateNum: String
}
type userByRole{
  user_id: Int
  first_name: String!
  last_name: String!
  phone_num: Bigint!
  email: String!
  user_name: String!
  role: String!
  broker_id: Int
  state: String
  district: String
  reraVerified: Boolean
  reraCertificateNum: String
}
type property{
  shortDescription: String
  description: String
  furnishingType: Int
  propertyType: Int
  categoryType: Int
  owner: String
  postedBy: Int
}
type propertyDetails{
  propertyId: Int
  size: String
  NumberOfBedrooms: Int
  NumberOfBathrooms: Int
  carSpace: Int
  listingType: Int
  price: String
  rent: String
  maintenanceCharges: String
  maintenanceType: Int
  amenities: Int
  bhkType: Int
  directionFacing: String
  numberOfCabins: Int
  availableFrom: String
  availableTill: String
}
type address{
  propertyId: Int
  street: String
  city: String
  state: String
  zipCode: String
}
type owner {
  name: String!
  phone_number: Bigint!
  email: String!
}
type propertyType {
  id: Int
  name: String
  description: String
  propertyCategory: Int!
}
type propertyCategory {
  id: Int
  name: String
  description: String,
}
type furnishingType {
  id: Int
  name: String
  description: String
}
type amenities {
  id: Int
  name: String
  description: String
}
type listingType {
  id: Int
  listingTypeName: String
  description: String
}
type variants {
  id: Int!
  name: String!
  description: String!
}

type AuthResponse {
    user: realEstateUser
    token: String
  }
type Query{
    getUserByRole(id: Int): [userByRole!]
    getPropertyCategories(id: Int): [variants!]
    getPropertyType(id: Int, categoryId: Int): [propertyType!]
    getPropertyAmenities(id: Int): [variants!]
    getPropertyBhkType(id: Int): [variants!]
    getPropertyListingType(id: Int): [variants!]
    getPropertyFurnishingType(id: Int): [variants!]
    getPropertyMaintenanceType(id: Int): [variants!]
  }
  type Mutation{
    registerRealEstateUser(
      first_name: String!
      last_name: String!
      phone_num: Bigint!
      email: String!
      user_name: String!
      password: String!
      role: String!
      state: String
      district: String
      reraCertificateNum: String
    ): Int!
    loginRealEstateUser(
      email: String!
      password: String!
    ): AuthResponse
   addProperty(
    shortDescription: String!
    description: String!
    furnishingType: Int!
    categoryType: Int!
    propertyType: Int!
    available: Boolean!
    ownerName: String!
    ownerPhoneNumber: Bigint!
    ownerEmail: String!
    postedBy: Int!
    size: String!
    built_up_area_sqft: Int!
    NumberOfBedrooms: Int
    NumberOfBathrooms: Int
    carSpace: Int
    listingType: Int!
    maintenanceType: Int!
    price: String
    rent: String
    maintenanceCharges: String
    amenities: String!
    bhkType: Int!
    directionFacing: String!
    numberOfCabins: Int
    availableFrom: String!
    availableTill: String!
    street: String
    city: String!
    state: String!
    zipCode: String!
    ): Int!
  }
 `;

module.exports = realEstateTypeDefs;