const User = require("./../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { sendEmail } = require("../utils/email")

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            throw new Error("all fields required")
        }
        const found = await User.findOne({ email })
        if (found) {
            throw new Error("email already exists")
        }
        const hashpass = await bcrypt.hash(password, 10)
        const result = await User.create({ name, email, password: hashpass })

        const token = jwt.sign({ id: result._id }, process.env.JWT_KEY)
        sendEmail({
            sendTo: email,
            sub: "welcome to mern e commerce ",
            msg: "Hello and welcome to our website! We're thrilled to have you here. Please feel free to explore and discover all that we have to offer. If you have any questions or need assistance, don't hesitate to reach out. Thank you for registring with us!."
        })


        res.json({
            message: "User Register Successfully",
            result: {
                id: result._id,
                name,
                token
            }
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}

exports.editUser = async (req, res) => {
    try {
        // const { id } = req.params
        // console.log(req.body)
        // console.log(req.body.userId);
        const result = await User.findByIdAndUpdate(req.body.userId, req.body)
        res.json({
            message: "User updated Successfully",
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const result = await User.findByIdAndDelete(id)
        res.json({
            message: "User deleted Successfully",
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const result = await User.find()
        res.json({
            message: "Users fetched Successfully",
            result
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}

exports.getSingleUsers = async (req, res) => {
    try {
        const { id } = req.params
        const result = await User.findOne({ _id: id })  //ithe means findone madhe sangava lagta kashane shodhaycha ahe
        if (!result) {
            throw new Error("userr not found")
        }
        res.json({
            message: "User fetched Successfully",
            result
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const result = await User.findOne({ _id: req.body.userId }).select(" -_id -__v -createdAt -updatedAt")
        if (!result) {
            throw new Error("userr not found")
        }
        res.json({
            message: "User profile Successfully",
            // result
            result: {
                email: result.email,
                password: result.password,
                mobile: result.mobile ? result.mobile : "",
                house: result.house ? result.house : "",
                pincode: result.pincode ? result.pincode : "",
                city: result.city ? result.city : "",
                landmark: result.landmark ? result.landmark : "",
                state: result.state ? result.state : "",

            }
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}

exports.destroyUsers = async (req, res) => {
    try {
        await User.deleteMany()
        res.json({
            message: "all users deleted Successfully",
        })
    } catch (error) {
        res.status(400).json({
            message: "Error" + error,

        })
    }
}





