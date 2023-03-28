const { loginUser, loginEmployee, continueWithGoogle, ForgetPassword, resetPassword } = require("../controllers/authController")
const { loginLimiter } = require("../middlewares/limiter")

const router = require("express").Router()

router
    .post("/user/login", loginLimiter, loginUser)
    .post("/user/login-with-google", loginLimiter, continueWithGoogle)
    .post("/user/forget-password", loginLimiter, ForgetPassword)
    .post("/user/reset-password", loginLimiter, resetPassword)

    .post("/employee/login", loginLimiter, loginEmployee)



module.exports = router