const Product = require("./../models/Product")
const asyncHandler = require("express-async-handler")
const { productUpload } = require("../utils/upload")
const jwt = require("jsonwebtoken")
const fs = require("fs").promises
const path = require("path")

exports.addProduct = asyncHandler(async (req, res) => {

    productUpload(req, res, async err => {
        // console.log(req.body);
        // console.log(req.files);

        // const { token } = req.cookies
        const token = req.headers.authorization
        const { id } = jwt.verify(token, process.env.JWT_KEY)

        req.body.employeeId = id
        const { name, brand, category, desc, price, stock, employeeId } = req.body
        if (!name || !brand || !category || !desc || !price || !stock || !employeeId) {
            return res.status(400).json({
                message: "all fields required"
            })
        }

        if (err) {
            return res.status(400).json({
                message: "multer error" + err
            })
        }
        const fileNames = []
        for (let i = 0; i < req.files.length; i++) {
            // assets/images/products
            fileNames.push(`assets/images/products/${req.files[i].filename}`)
        }

        const result = await Product.create({ ...req.body, image: fileNames })
        res.json({
            message: "product added successfully"
        })
    })
})



exports.getAllProducts = asyncHandler(async (req, res) => {
    const result = await Product.find().select("-employeeId -createdAt -updatedAt -__v")

    res.json({
        message: "all products fetched successfully by admin",
        result: {
            data: result,
            count: result.length,
        }
    })

})

exports.getUserProducts = asyncHandler(async (req, res) => {
    const result = await Product.find({ publish: true }).select("-employeeId -createdAt -updatedAt -__v")

    res.json({
        message: "all products fetched successfully by user",
        result: {
            data: result,
            count: result.length,
        }
    })

})




exports.getSingleProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const result = await Product.findById(productId).select("-employeeId -createdAt -updatedAt -__v")
    if (!result) {
        return res.status(400).json({
            message: "Invalid product Id"
        })
    }
    res.json({
        message: `products fetched successfully  of ${productId}`,
        result
    })

})

exports.deleteSingleProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const result = await Product.findByIdAndDelete(productId)
    res.json({
        message: "products deleted successfully",

    })

})


exports.destroyProducts = asyncHandler(async (req, res) => {
    const result = await Product.deleteMany()
    // await fs.unlink(path.join(__dirname, "..", "public"))
    if (!result) {
        return res.status(401).json({
            message: "Invalid product Id"
        })
    }
    res.json({
        message: "all products deleted successfully",
    })

})

exports.updateProductData = asyncHandler(async (req, res) => {
    // console.log(req.files);
    // console.log(req.body);
    const { productId } = req.params
    const singleProduct = await Product.findById(productId)
    if (!singleProduct) {
        return res.status(400).json({
            message: "Invalid Product Id"
        })
    }
    // images = singleProduct.image
    productUpload(req, res, async err => {
        if (err) {
            // console.log(err)
            return res.status(400).json({
                message: "Multer Error " + err
            })
        }

        let fileNames = []
        for (let i = 0; i < req.files.length; i++) {
            fileNames.push(`assets/images/products/${req.files[i].filename}`)
        }
        if (fileNames.length > 0) {
            for (let i = 0; i < singleProduct.image.length; i++) {
                await fs.unlink(path.join(__dirname, "..", "public", singleProduct.image[i]))
            }
        } else {
            fileNames = singleProduct.image
        }


        const result = await Product.findByIdAndUpdate(productId, {
            ...req.body,
            image: fileNames,
        }, { new: true })

        res.json({
            message: "product updated successfully",
            result
        })
    })

})

exports.updateProductImages = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const singleProduct = await Product.findById(productId)
    if (!singleProduct) {
        return res.status(400).json({
            message: "Invalid Product Id"
        })
    }

    // productUpload(req, res, async err => {
    //     if (err) {
    //         return res.status(400).json({
    //             message: "Multer Error " + err
    //         })
    //     }
    //     for (let i = 0; i < singleProduct.image.length; i++) {
    //         await fs.unlink(path.join(__dirname, "..", "public", singleProduct.image[i]))
    //     }

    //     const fileNames = []
    //     for (let i = 0; i < req.files.length; i++) {
    //         fileNames.push(`assets/images/products/${req.files[i].filename}`)
    //     }
    //     const result = await Product.findByIdAndUpdate(productId, {
    //         image: fileNames
    //     }, { new: true })

    //     res.json({ message: "ok" })


    // }
    // )

})
