const Product = require("../models/Product")
const Order = require("../models/Order")
const Cart = require("../models/Cart")
const asyncHandler = require("express-async-handler")
const { format } = require("date-fns")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const { v4: uuid } = require("uuid")
const { sendEmail } = require("../utils/email")
const User = require("../models/User")
const { orderReceipt } = require("../utils/emailTemplates")


exports.placeOrder = asyncHandler(async (req, res) => {
    const { userId, type } = req.body
    if (!type) {
        return res.status(400).json({
            message: "please provide type"
        })
    }
    let productArray
    if (type === "buynow") {
        productArray = [{
            productId: req.body.productId,
            qty: req.body.qty
        }]
    } else {
        const cartItems = await Cart.findOne({ userId })
        await Cart.deleteOne({ userId })
        productArray = cartItems.products
    }
    const result = await Order.create({
        userId,
        products: productArray,
        paymentMode: "cod"
    })

    res.json({
        message: "order placed successfully",
        result
    })
})


exports.getUserOrders = asyncHandler(async (req, res) => {
    // const result = await Order.find({ userId: req.body.userId }).select(" -createdAt -updatedAt -__v").populate("userId")
    const result = await Order.find({ userId: req.body.userId }).select(" -createdAt -updatedAt -__v")
        .populate("products.productId")  //this is alternate way

    // .populate({
    //     path: "products",
    //     populate: {
    //         path: "productId",
    //         model: "product"
    //     }
    // })


    res.json({
        message: "order get successfully",
        result
    })
})


exports.userCancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const result = await Order.findByIdAndUpdate(orderId, {
        orderStatus: "cancel"
    })

    res.json({
        message: "order canceled successfully",
        result
    })
})

exports.destroyOrder = asyncHandler(async (req, res) => {
    const result = await Order.deleteMany()

    res.json({
        message: "all orders deleted successfully",

    })
})

exports.orderPayment = asyncHandler(async (req, res) => {
    const instanse = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    })
    instanse.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: uuid()
    }, (err, order) => {
        if (err) {
            return res.status(400).json({
                message: "Order fail" + err
            })
        }
        res.json({
            message: "Payment Initiated",
            order
        })
    })


})



exports.verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_signature, razorpay_order_id, razorpay_payment_id, } = req.body
    const key = `${razorpay_order_id}|${razorpay_payment_id}`

    const expectedSignature = crypto
        .createHmac("sha256", `${process.env.RAZORPAY_SECRET}`)
        .update(key.toString())
        .digest("hex")

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
            message: "Invalid payment, signature mismatched"
        })
    }
    const { userId, type } = req.body
    const user = await User.findOne({ _id: userId })

    let cartItems, result, productDetails, formatedCartItems, total
    if (type === "cart") {
        cartItems = await Cart.findOne({ userId })

        productDetails = await Cart.findOne({ userId: userId })  //ithe populate zalela data phije hota
            .populate("products.productId", "name price brand image category desc")  //ithe - deun keys minus krto or add pn krto "" madhe
            .select("-__v -createdAt -updatedAt -userId -_id").lean()

        formatedCartItems = productDetails.products.map(p => {
            return {
                ...p.productId,
                qty: p.qty
            }

        })

        // console.log("hii", formatedCartItems)
        total = formatedCartItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
        // console.log(formatedCartItems);

        await Cart.deleteOne({ userId })

    }
    else if (type === "buynow") {
        cartItems = {
            products: [{
                productId: req.body.productId,
                qty: req.body.qty
            }]
        }
        const p = await Product.findOne({ _id: req.body.productId })
        total = p.price * req.body.qty
        formatedCartItems = [{
            name: p.name,
            price: p.price,
            qty: req.body.qty
        }]

    }


    result = await Order.create({
        userId,
        products: cartItems.products,
        paymentMode: "online",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentSignature: razorpay_signature,
        paymentStatus: "paid"

    })

    sendEmail({
        sendTo: user.email,
        htmlMsg: orderReceipt({
            userName: user.name,
            date: format(Date.now(), "dd-MM-yyyy"),
            orderId: result._id,
            products: formatedCartItems,
            total
        }),
        msg: `
        Thank you for your order \n
        order Id:${result._id} \n
        Payment Status:Paid\n
        Payment Mode:Online \n
        Payment Id:${result.paymentId}\n
    `
    })

    res.json({
        message: "payment success"
    })

})










