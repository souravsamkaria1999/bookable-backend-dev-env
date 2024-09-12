const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const path= require('path');

let transporter;
// if(process.env.SUBSCRIPTION_DETAILS_NOTIFICATION_EMAIL_TO_OWNER == 'xyz'){
//   console.log('transporter is disabled in the local environment');
//   return;
// }

const transport = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  }
};

transporter = nodemailer.createTransport(transport);


const handlebarOptions = {
  viewEngine: {
    extName: process.env.viewEngineExtension,
    partialsDir: path.resolve('src/sharedMethod/emailTemplates'),
    defaultLayout: false,
  },
  viewPath: path.resolve('src/sharedMethod/emailTemplates'),
  extName: process.env.templateExtension,
};

transporter.use('compile',hbs( handlebarOptions ));

  (async () => {
    try {
      // verify connection configuration
      await transporter.verify();
      console.log('transporter verified');
    } catch (error) {
      console.error('Error verifying transporter:', error);
    }
  })();

module.exports.transporter = transporter;


