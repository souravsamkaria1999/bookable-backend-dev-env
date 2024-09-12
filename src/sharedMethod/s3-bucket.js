const AWS = require("aws-sdk");
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const config = require("config");

const region = config.get("AWS.region");
const key = config.get("AWS.accessKeyId");
const skey = config.get("AWS.secretAccessKey");
const bucket = config.get("AWS.bucket");

// configuring aws with crendentials
AWS.config.update({
  region,
  credentials: {
    accessKeyId: key,
    secretAccessKey: skey,
  },
});
// uploading file 
const fileUpload = (req, res) => {
  try {
    const s3 = new AWS.S3({});
    const fileName = `${Date.now()}-${req.file.originalname}`;
    let uploadParams = { Key: fileName, Bucket: bucket, Body: req.file.buffer };
    s3.upload(uploadParams, (err, response) => {
      if (err) console.log(err);
      res.send({image:response.key});
    });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

module.exports = { AWS,fileUpload };
