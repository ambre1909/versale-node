const rateLimiter = require("express-rate-limit")
const { logEvent } = require("./logger")
const { format } = require("date-fns")

exports.loginLimiter = rateLimiter({
    windowMs: 60 * 1000,   //1 min
    max: 100,              //kiti req houn dyayche ek mintat te sangaycha ithe 
    message: "too many attemps",
    handler: (req, res, next, options) => {
        const msg = `${format(new Date(), "dd-MM-yyyy\tHH:mm:ss")}\t${req.url}\t${req.method}\t${req.headers.origin}\t too many login attempts\n`
        logEvent({
            message: msg,
            fileName: "error.log"
        })
        res.status(401).json({
            message: "too many attempts,please try after 60 seconds"
        })
    }
})