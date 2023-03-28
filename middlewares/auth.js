const jwt = require("jsonwebtoken")
const Employee = require("./../models/Employee")
const asyncHandler = require("express-async-handler")
const User = require("../models/User")

exports.adminProtected = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization
    // const token = req.cookies.token
    // console.log(req.cookies)
    console.log("protected", token)

    if (!token) {
        return res.status(401).json({
            message: "please provide Token"
        })
    }
    const { id } = jwt.verify(token, process.env.JWT_KEY)
    // console.log("protectedverify", token)

    const result = await Employee.findById(id)
    if (!result) {
        return res.status(401).json({
            message: "can not find user"
        })
    }
    if (result.role !== "admin") {
        return res.status(401).json({
            message: "Admin Only Route,please get in touch with admin"
        })
    }
    req.body.employeeId = id  //ithe nhi chalnar karan multer over write krta  dusrya route madhe chalel multer sodun
    next()
})

exports.Protected = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization
    // console.log("xxx", req.cookies);
    console.log(token)
    if (!token) {
        return res.status(401).json({
            message: "please provide Token"
        })
    }
    // const [, tk] = token.split(" ")
    const tk = token.split(" ")[1]

    const { id } = jwt.verify(tk, process.env.JWT_KEY)
    if (!id) {
        return res.status(401).json({
            message: "invalid token"
        })
    }
    const result = await User.findById(id)
    if (!result.active) {
        return res.status(401).json({
            message: "account is blocked by admin"
        })
    }
    req.body.userId = id
    next()
})


