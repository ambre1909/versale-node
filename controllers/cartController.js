const asyncHandler = require("express-async-handler")
const Cart = require("../models/Cart")



exports.addToCart = asyncHandler(async (req, res) => {

    const { userId, qty, productId } = req.body
    if (!qty || !productId) {
        return res.status(400).json({
            message: "All Fields sre Required"
        })
    }

    const cartItems = await Cart.findOne({ userId })  //hya id cha user ahe ki nhii database madhe 
    if (cartItems) {
        // data ahe 
        const index = cartItems.products.findIndex(p => p.productId.toString() === req.body.productId)
        if (index >= 0) {
            // set qty
            cartItems.products[index].qty = req.body.qty
        } else {
            cartItems.products.push(req.body)

        }
        const result = await Cart.findByIdAndUpdate(cartItems._id, cartItems, { new: true })
        //findByIdAndUpdate juni entry dakhavte thsta why new :true  


        // console.log(result);
        res.json({
            message: "cart  updated  to successfully",
            // result
        })
    } else {
        // data nhii 
        const cartItem = {
            userId,
            products: [req.body],
        }
        const result = await Cart.create(cartItem)
        // console.log(result);

        res.json({
            message: "Product added  to cart successfully",
            // result
        })
    }



})


exports.getCartData = asyncHandler(async (req, res) => {
    const { userId } = req.body

    const result = await Cart.findOne({ userId: userId })
        .populate("products.productId", "name price brand image category desc")  //ithe - deun keys minus krto or add pn krto "" madhe
        .select("-__v -createdAt -updatedAt -userId -_id").lean()  // lean() karan find mongoose cha object return krt hota

    if (!result) {
        return res.status(200).json({
            message: "cart is empty ",
            result: []
        })
    }
    // console.log(result)
    const formatedCartItems = result.products.map(p => {
        return {
            ...p.productId,
            qty: p.qty
        }

    })
    // console.log(formatedCartItems)

    res.json({
        message: "cart products fetched successfully",
        result: formatedCartItems,
    })
})


exports.removeSingleCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const { userId } = req.body
    const result = await Cart.findOne({ userId })
    const index = result.products.findIndex(item => item.productId.toString() === productId)
    result.products.splice(index, 1)
    const x = await Cart.findByIdAndUpdate(result._id, result, { new: true })
    // console.log(x);
    res.json({
        message: "single cart item deleted successfully",
        x
    })
})



exports.emptyCart = asyncHandler(async (req, res) => {
    const { userId } = req.body
    // const result = await Cart.deleteOne({ userId: userId })
    const result = await Cart.deleteOne({ userId })

    res.json({
        message: "cart  empty successfully",
        result
    })
})



exports.destroyCart = asyncHandler(async (req, res) => {

    const result = await Cart.deleteMany()

    res.json({
        message: "destroy  successfully",

    })
})

