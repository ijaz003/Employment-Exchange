export const sendToken = (user, statusCode, res, message) => {
  console.log("before making token", user);  
  const token = user.getJWTToken();
  console.log("token", token);
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Set httpOnly to true
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};
