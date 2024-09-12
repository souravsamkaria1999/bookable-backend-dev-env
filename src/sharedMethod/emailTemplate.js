
exports.subscription_Subscribed = ( to, userid,username,userEmail,planDuration,charges,startDate) => {
  return {
    to: to,
    subject: "Subscription Purchase Details",
    text: ` 
      Dear Sir,
        This email is about a recent subscription purchase made by a user on our website.
        Below are the details of the subscription:

        User Information:

         userID:  ${userid}
         Username: ${username}
         Email: ${userEmail}

        Subscription Details:

         Subscription Duration: ${planDuration}
         Amount Paid : ${charges}
         Start Date: ${startDate}

    Best regards,
    bookable
`,
  };
};
