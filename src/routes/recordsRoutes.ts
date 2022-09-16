import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class RecordsRoutes extends BaseRoutes {
  routes() {
    /* auth routes */
    // for testing purposes
    router.use(this.JWTMiddleware);
    router.post("/newRecord", this.controller.newRecord.bind(this.controller));
    router.put("/editRecord", this.controller.editRecord.bind(this.controller));
    router.put(
      "/deleteRecord",
      this.controller.deleteRecord.bind(this.controller)
    );
    return router;
  }
}
