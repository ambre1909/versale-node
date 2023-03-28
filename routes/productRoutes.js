const { addProduct, getAllProducts, getSingleProduct, deleteSingleProduct, destroyProducts, updateProductData, updateProductImages, getUserProducts } = require("../controllers/productController")
const { adminProtected } = require("../middlewares/auth")

const router = require("express").Router()
router
    .get("/user-products", getUserProducts)
    .get("/details/:productId", getSingleProduct)

    .get("/", getAllProducts)
    .put("/update/:productId", updateProductData)
    .delete("/delete/:productId", adminProtected, deleteSingleProduct)
    .delete("/destroy", adminProtected, destroyProducts)
    .post("/add-product", adminProtected, addProduct)
// .put("/update-product/:productId", adminProtected, updateProductImages)



module.exports = router 