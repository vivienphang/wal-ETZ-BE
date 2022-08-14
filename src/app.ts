import express from "express";

require("dotenv").config();

const app: express.Application = express();

const PORT: number | string = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});
