export const errorHandler = (err, req, res, next) => {
  //   console.log(err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  switch (err.name) {
    // JWT
    case "JsonWebTokenError":
      status = 401;
      message = "Invalid token";
      break;

    case "TokenExpiredError":
      status = 401;
      message = "Token expired";
      break;

    // Sequelize
    case "SequelizeValidationError":
      status = 400;
      message = err.errors.map((e) => e.message);
      break;

    case "SequelizeUniqueConstraintError":
      status = 400;
      message = "Data already exists";
      break;

    //  Custom
    case "NotFound":
      status = 404;
      message = "Data not found";
      break;

    case "Unauthorized":
      status = 401;
      message = "Unauthorized";
      break;

    case "Forbidden":
      status = 403;
      message = "Forbidden";
      break;

    // Multer / Upload
    case "MulterError":
      status = 400;
      message = err.message;
      break;

    default:
      break;
  }

  res.status(status).json({ message });
};
