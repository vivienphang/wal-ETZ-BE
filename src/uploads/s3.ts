/* eslint-disable import/no-import-module-exports */
/* eslint-disable import/prefer-default-export */
import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const bucketName = process.env.BUCKET_NAME;
// Connect to S3 bucket
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

export async function generateUploadURL() {
  // the name that is unique for each image
  const imageName = Date.now().toString();

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };

  const uploadURL: string = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
}

const upload = (bucketName: any) => {
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName, // "bucket-for-capstone",
      metadata(
        req: any,
        file: { fieldName: any },
        // eslint-disable-next-line no-unused-vars
        cb: (arg0: null, arg1: { fieldName: any }) => void
      ) {
        cb(null, { fieldName: file.fieldName });
      },
      key(req, file, cb) {
        cb(null, "image.jpeg"); // accepts 2 params, null and file name as image.jpeg
      },
    }),
  });
};

module.exports = upload;
