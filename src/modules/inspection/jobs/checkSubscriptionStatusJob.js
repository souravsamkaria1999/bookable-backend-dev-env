const reraAndInspectionSubscriptionAccessSchedule = require("node-schedule");
const {
  checkTrialPeriod,
  getAllUsersData,
} = require("../resolver_funciton/resolver");

reraAndInspectionSubscriptionAccessSchedule.scheduleJob("0 0 * * *", async function () {
  const allUsersAndSubs = await getAllUsersData();

  allUsersAndSubs.map(async (user) => {
    checkTrialPeriod(user.userId, user.serviceType);
  });
});

module.exports = reraAndInspectionSubscriptionAccessSchedule;

// const date = new Date(1,*,*,13,12,0);
// '0 * * * *'   // format for every hour
// '*/1 * * * * *' // format for second
// '*/2 * * * *'  // format for minute(every 2 minute)
