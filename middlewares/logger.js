const fs = require("fs")
const { format } = require("date-fns")
const prepend = require("prepend-file")

const logEvent = async ({ fileName, message }) => {
    try {
        if (!fs.existsSync("./logs")) {
            fs.mkdirSync("./logs")
        }
        await prepend(`./logs/${fileName}`, message)  // prepend yamula  new logs file chya starting la distat 
    } catch (error) {
        console.log(error)
    }
}


const log = (req, res, next) => {
    const msg = `${format(new Date(), "dd-MM-yyyy \t HH:mm:ss")}\t${req.method}\t${req.url}\t${req.headers.origin}\n`
    logEvent({
        fileName: "req.log", message: msg
    })
    next()
}

module.exports = {
    log,
    logEvent
}