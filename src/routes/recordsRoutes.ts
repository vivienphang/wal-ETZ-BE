import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class RecordsRoutes extends BaseRoutes {
  routes() {
    /* auth routes */
    // for testing purposes
<<<<<<< HEAD
    router.use(this.JWTMiddleware);
=======
>>>>>>> 04dfca3bcb6a54cbf73f73323569a2354e59655f
    router.post("/newRecord", this.controller.newRecord.bind(this.controller));
    return router;
  }
}
