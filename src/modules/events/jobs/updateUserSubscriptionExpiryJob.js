// const userSubscriptionEndDateUpdateSchedule = require("node-schedule");
// const { reraConn } = require("../../../dbconfig");

// userSubscriptionEndDateUpdateSchedule.scheduleJob("*/1 * * * * *", async function randomUpdate() {
//   try {
//     const subscriptionUserQuery = `SELECT ss.user_id, ss.createdAt, ss.plan_choosen, sa.title 
//         FROM Subscription_subscribed AS ss LEFT JOIN Subscription_Available AS sa 
//         ON ss.plan_choosen = sa.id WHERE ss.end_date IS NULL`;

//     const userSubscription = await new Promise((resolve, reject) => {
//       reraConn.query(subscriptionUserQuery, (err, res) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(res);
//         }
//       });
//     });

//     if ( userSubscription.length <= 0) {
//       return;
//     }

//     for (const user of userSubscription) {
//       const timestamp = user.createdAt;
//       const milliseconds = timestamp * 1000;
//       const date = new Date(milliseconds);

//       if (user.title === "Basic month" || user.title === "Premium month") {
//         date.setDate(date.getDate() + 30);
//       } else if (user.title === "Basic year" || user.title === "Premium year") {
//         date.setDate(date.getDate() + 365);
//       } else {
//         date.setDate(date.getDate() + 30);
//       }

//       const SubscriptionEndDate = Math.floor(date.getTime() / 1000);

//       const updateQuery = `UPDATE Subscription_subscribed 
//             SET end_date = ${SubscriptionEndDate} 
//             WHERE user_id = ${user.user_id} 
//             AND plan_choosen = ${user.plan_choosen}
//             AND createdAt = ${user.createdAt} 
//             AND end_date IS NULL`;

//       try {
//         const updateUserSubscriptionEndDate = await new Promise(
//           (resolve, reject) => {
//             reraConn.query(updateQuery, (err, result) => {
//               if (err) {
//                 reject(err);
//               } else {
//                 resolve(
//                   `subscription expiry time has been updated for  ${user.user_id}+'-'+${user.plan_choosen}`
//                 );
//               }
//             });
//           }
//         );
//       } catch (error) {
//         console.error(
//           `Error updating subscription end_date for user ${user.user_id}: ${error}`
//         );
//       }
//     }
//   } catch (error) {
//     console.error(`Error fetching user subscriptions data: ${error}`);
//   }
// });

// module.exports = userSubscriptionEndDateUpdateSchedule;


// // const date = new Date(1,*,*,13,12,0);
// // '0 * * * *'   // format for every hour
// // '*/1 * * * * *' // format for second
// // '*/2 * * * *'  // format for minute(every 2 minute)

