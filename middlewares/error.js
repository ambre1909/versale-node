const { logEvent } = require("./logger")
const { format } = require("date-fns")

exports.errorHandler = (err, req, res, next) => {
    try {
        const msg = `${format(new Date(), "dd-MM-yyyy \t HH:mm:ss")}\t${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}\n`
        logEvent({
            fileName: "error.log",
            message: msg
        })
        console.log("---------------")
        console.log(err)
        console.log("------------------")
        res.status(400).json({
            message: "Error" + err
        })
    } catch (error) {
        console.log(error);
    }




}

