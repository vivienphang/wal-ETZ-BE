// import S3Client from "aws-sdk/clients/s3";
// import aws from "aws-sdk";
import express, { Router } from "express";
import multer from "multer";
// import multerS3 from "multer-s3";
import BaseRoutes from "./baseRoutes";
// Set the name of the upload directory here
const multerUpload = multer!({ dest: "uploads/" });
// const s3Config = new aws.S3Client({
//   region: process.env.S3_BUCKET_REGION,
//   credentials: {
//     accessKeyId: process.env.S3_ACCESS_KEY as string,
//     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
//   },
// });

// const multerUpload = multer({
//   storage: multerS3({
//     s3: s3Config,
//     bucket: "bucket-name",
//     metadata(req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key(req, file, cb) {
//       cb(null, "image.jpeg");
//     },
//   }),
// });

const router: Router = express.Router();

export default class UsersRoutes extends BaseRoutes {
  routes() {
    /* no auth routes */
    router.post("/signup", this.controller.signUp.bind(this.controller));
    router.post("/login", this.controller.logIn.bind(this.controller));

    /* auth routes */
    router.use(this.JWTMiddleware);

    router.post("/refresh", this.controller.JWTRefresh.bind(this.controller));
    router.get(
      "/populateAccounts",
      this.controller.populateAccounts.bind(this.controller)
    );
    router.get(
      "/populateRecords",
      this.controller.populateRecords.bind(this.controller)
    );

    router.post(
      "/updateUsernameOnly",
      this.controller.updateUsernameOnly.bind(this.controller)
    );
    router.post(
      "/updateCurrencyOnly",
      this.controller.updateCurrencyOnly.bind(this.controller)
    );
    router.post(
      "/updateProfile",
      this.controller.updateProfile.bind(this.controller)
    );
    router.post(
      "/updatePicture",
      multerUpload.single("file"),
      this.JWTMiddleware,
      this.controller.updatePicture.bind(this.controller)
    );
    return router;
  }
}
