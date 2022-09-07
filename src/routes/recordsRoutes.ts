import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class RecordsRoutes extends BaseRoutes {
  routes() {
    /* no auth routes */
    // for testing purposes
    router.post("/newRecord", this.controller.newRecord.bind(this.controller));
    return router;
  }
}
