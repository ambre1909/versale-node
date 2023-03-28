const User = require("./../models/User")
const Employee = require("../models/Employee")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Cart = require("../models/Cart")
const { OAuth2Client } = require("google-auth-library")
const { sendEmail } = require("../utils/email")


exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({
            message: "all fields are required"
        })
    }
    const result = await User.findOne({ email }).lean()
    if (!result) {
        return res.status(401).json({
            message: "email is not registered with us"
        })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        return res.status(401).json({
            message: "email or password  is wrong"
        })
    }
    if (!result.active) {
        return res.status(401).json({
            message: "account is blocked by admin"
        })
    }
    // const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "15m" })
    const token = jwt.sign({ id: result._id }, process.env.JWT_KEY,
        { expiresIn: "1w" }
    )

    const cart = await Cart.find({ userId: result._id })


    // res.cookie("user", token, {
    //     // httpOnly: true,
    //     // secure: true,
    //     // maxAge: 1000 * 60 * 15
    // })

    res.json({
        message: "Login Success",
        result: {
            name: result.name,
            email: result.email,
            cart,
            token
        }
    })
})

exports.loginEmployee = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({
            message: "all fields are required"
        })
    }
    const result = await Employee.findOne({ email }).lean()

    if (!result) {
        return res.status(401).json({
            message: "email is not registered with us"
        })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        return res.status(401).json({
            message: "email or password  is wrong"
        })
    }
    // const token = jwt.sign({ id: result._id }, process.env.JWT_KEY, { expiresIn: "15m" })
    const token = jwt.sign({ id: result._id }, process.env.JWT_KEY)
    // res.cookie("token", token, {
    //     // maxAge: 1000 * 60 * 60,
    //     httpOnly: true,
    //     // secure:true
    // })
    if (!result.active) {
        return res.status(401).json({
            message: "account is blocked .get in touch with admin"
        })
    }
    console.log(token);
    res.json({
        message: "Login Success",
        result: {
            name: result.name,
            email: result.email,
            id: result._id,
            token
        }
    })
})


exports.continueWithGoogle = asyncHandler(async (req, res) => {
    const { tokenId } = req.body
    if (!tokenId) {
        return res.status(400).json({
            message: "please provide google token id"
        })
    }

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const { payload: { name, email, picture } } = await googleClient.verifyIdToken({
        idToken: tokenId
    })
    const result = await User.findOne({ email }).lean()  //spread krto tevha vegla data hota tysathi lean deto 

    if (result) {
        if (!result.active) {
            return res.status(401).json({
                message: "account is blocked by admin"
            })
        }

        // login
        const token = jwt.sign({ id: result._id }, process.env.JWT_KEY,
            { expiresIn: "1w" }
        )
        const cart = await Cart.find({ userId: result._id })
        res.json({
            message: "Login Success",
            result: {
                ...result,
                cart,
                token
            }
        })

    } else {
        // register
        const password = await bcrypt.hash(Date.now().toString(), 10)
        const user = {
            name,
            email,
            password
        }
        const result = await User.create(user).lean()
        const token = jwt.sign({ id: result._id }, process.env.JWT_KEY)
        res.json({
            message: "user registration   Success",
            result: {
                ...result,
                cart: [],
                token

            }
        })



    }





    // res.cookie("user", token, {
    //     // httpOnly: true,
    //     // secure: true,
    //     // maxAge: 1000 * 60 * 15
    // })


})


exports.ForgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const result = await User.findOne({ email }).lean()
    if (!result) {
        return res.status(400).json({
            message: "email is not registered with us"
        })
    }
    sendEmail({
        sendTo: email,
        sub: " about Forget password",
        msg: ` hello ${result.name}
        we received request regarding reset password click on link to reset password
        http://localhost:3000/reset-password/${result._id}
        
        `
        ,
    })

    res.json({
        message: "reset password email send sucessfully ",

    })
})

exports.resetPassword = asyncHandler(async (req, res) => {
    const { password, userId } = req.body
    // console.log(password, userId)
    if (!password || !userId) {
        return res.status(400).json({
            message: "all fields are required"
        })
    }
    const hashpass = await bcrypt.hash(password, 10)
    const result = await User.findByIdAndUpdate(userId, { password: hashpass })

    res.json({
        message: "reset password  sucessfully ",

    })
})