/** BizTime express application. */
const express = require("express");
const cRouter = require("./routes/companies");
const invRouter = require("./routes/invoices");
const indRouter = require("./routes/industries");
const ExpressError = require("./expressError")

const app = express();

app.use(express.json());
app.use("/companies", cRouter);
app.use("/invoices", invRouter);
app.use("/industries", indRouter);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  res.status(status).json({ 
      error: { message, status }
  });
});


module.exports = app;
