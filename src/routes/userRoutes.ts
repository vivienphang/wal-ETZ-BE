import express, { Router } from "express";

import multer from "multer";
import BaseRoutes from "./baseRoutes";
// Set the name of the upload directory here
const multerUpload = multer!({ dest: "uploads/" });

const router: Router = express.Router();

export default class UsersRoutes extends BaseRoutes {
  routes() {
    router.get("/testRedis", this.controller.testRedis.bind(this.controller));
    router.get(
      "/testGetExchange",
      this.controller.testGetExchange.bind(this.controller)
    );

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
      "/updateProfile/",
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
