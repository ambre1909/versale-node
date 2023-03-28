const { format } = require("date-fns")
const express = require("express")
const cors = require("cors")
const { log, logEvent } = require("./middlewares/logger")
const connectDB = require("./config/db")
require("dotenv").config({ path: "./.env" })
const mongoose = require("mongoose")
const { errorHandler } = require("./middlewares/error")
const path = require("path")
const cookieParser = require("cookie-parser")
const { adminProtected } = require("./middlewares/auth")


const app = express()
connectDB()

app.use(log)
app.use(cookieParser())

app.use(cors({
    credentials: true,
    origin: (o, cb) => {
        const allowed = [
            "http://localhost:3000",
            "http:localhost:5173",
            "https://ambre1909.github.io/versale-react"
        ]
        if (allowed.indexOf(o) !== -1 || !o) {
            cb(null, true)
        } else {
            cb("blocked by cors")
        }
    }
}))

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
// app.use(express.static("public")) 👆 exactly same

app.use("/api/user", require("./routes/userRoutes"))
app.use("/api/employee", adminProtected, require("./routes/employeeRoutes"))
app.use("/api/auth", require("./routes/authRoute"))
app.use("/api/cart", require("./routes/cartRoutes"))
app.use("/api/order", require("./routes/orderRoutes"))
app.use("/api/products", require("./routes/productRoutes"))


app.use("*", (req, res) => {
    res.status(404).json({
        message: "404:you are looking for resource is not available"
    })
})

app.use(errorHandler)   //tikde try catch nhiye mhnun ha run karel ithe error print hoil
const PORT = process.env.PORT || 5000

mongoose.connection.once("open", () => {
    app.listen(PORT, console.log(`server running http://localhost:${PORT}`))
    console.log("mongo connected");
})

mongoose.connection.on("error", err => {
    const msg = `${format(new Date(), "dd-MM-yyyy \t HH:mm:ss")}\t${err.code}\t${err.name}`
    logEvent({
        fileName: "mongo.log",
        message: msg
    })
})

module.exports = app