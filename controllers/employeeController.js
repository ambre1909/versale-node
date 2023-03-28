const Employee = require("./../models/Employee")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const { sendEmail } = require("../utils/email")
const User = require("../models/User")
const Product = require("../models/Product")
const Order = require("../models/Order")
// const { findOne } = require("./../models/Employee")


exports.registerEmployee = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "all fields required"
        })
    }
    const duplicate = await Employee.findOne({ email })
    if (duplicate) {
        return res.status(400).json({
            message: "email already exist"
        })
    }
    const hashPass = bcrypt.hashSync(password, 10)
    const result = await Employee.create({
        ...req.body,
        password: hashPass,
        role: "intern"   //ekach admin phije mhnun ithe asa set kela
    })
    sendEmail({
        sendTo: email,
        sub: "welcome to SKILLHUB Team",
        msg: "Hello and welcome to the team! We're thrilled to have you here. Please feel free to explore and discover all that we have to offer. If you have any questions or need assistance, don't hesitate to reach out. Thank you for registring with us!."
    })

    res.json({
        message: "Employee Created Successfully"
    })
})

exports.getAllEmployees = asyncHandler(async (req, res) => {
    const result = await Employee.find()
    res.json({
        message: "employee fetched successfully",
        result: {
            count: result.length,
            data: result
        }
    })

})

exports.getSingleEmployee = asyncHandler(async (req, res) => {
    // const { employeeId } = req.params
    // const result = await Employee.findById(employeeId)
    // if (!result) {
    //     return res.status(401).json({
    //         message: "Invalid User Id"
    //     })
    // }
    console.log(req.cookies)
    res.json({
        message: "employee fetched successfully",
        // result
    })

})

exports.updateEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.params
    const result = await Employee.findById(employeeId)
    if (!result) {
        return res.status(401).json({
            message: "Invalid User Id"
        })
    }
    const { password, email } = req.body
    if (password) {
        return res.status(400).json({
            message: "can not change password"
        })
    }
    if (email) {
        const duplicate = await Employee.findOne({ email })
        if (duplicate) {
            return res.status(400).json({
                message: "duplicate email"
            })
        }
    }
    await Employee.findByIdAndUpdate(employeeId, req.body)

    res.json({
        message: "employee updated successfully",
    })

})

exports.deleteEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.params
    const result = await Employee.findOne({ _id: employeeId })
    if (!result) {
        return res.status(400).json({
            message: "invalid id"
        })
    }

    await Employee.findByIdAndDelete(employeeId)

    res.json({
        message: "employee deleted successfully",
    })

})


exports.destroyEmployees = asyncHandler(async (req, res) => {

    await Employee.deleteMany()
    res.json({
        message: "All Employees Deleted successfully",
    })

})

exports.adminGetAllUsers = asyncHandler(async (req, res) => {
    const result = await User.find()
    res.json({
        message: "Users fetched Successfully by admin",
        result
    })

})

exports.adminUserActivation = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const result = await User.findByIdAndUpdate(userId, {
        active: req.body.active
    })
    res.json({
        message: `user ${req.body.active ? "un blocked" : "block"} successfully `,
    })

})



exports.adminStat = asyncHandler(async (req, res) => {


    const users = await User.countDocuments()
    const activeUsers = await User.countDocuments({ active: true })
    const inActiveUsers = await User.countDocuments({ active: false })
    const products = await Product.countDocuments()
    const publishProducts = await Product.countDocuments({ publish: true })
    const unPublishProducts = await Product.countDocuments({ publish: false })
    const orders = await Order.countDocuments()
    const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" })
    const paidOrders = await Order.countDocuments({ paymentStatus: "paid" })
    const cODOrders = await Order.countDocuments({ paymentMode: "cod" })
    const onlineOrders = await Order.countDocuments({ paymentMode: "online" })
    const cancelOrders = await Order.countDocuments({ orderStatus: "cancel" })



    res.json({
        message: `Admin stat fetch  successfully `,
        result: {
            users,
            activeUsers,
            inActiveUsers,
            products,
            publishProducts,
            unPublishProducts,
            orders,
            deliveredOrders,
            paidOrders,
            cODOrders,
            onlineOrders,
            cancelOrders
        }
    })

})



