const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
