/** BizTime express application. */
const express = require("express");
const cRouter = require("./routes/companies");
const iRouter = require("./routes/invoices");
const ExpressError = require("./expressError")

const app = express();

app.use(express.json());
app.use("/companies", cRouter);
app.use("/invoices", iRouter);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
