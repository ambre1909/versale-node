const { placeOrder, getUserOrders, userCancelOrder, destroyOrder, orderPayment, verifyPayment } = require("../controllers/orderController")
const { Protected } = require("../middlewares/auth")


const router = require("express").Router()
router
    .post("/order-place", Protected, placeOrder)
    .post("/payment", orderPayment)
    .post("/payment/verify", Protected, verifyPayment)

    .get("/order-history", Protected, getUserOrders)
    .put("/order-cancel/:orderId", Protected, userCancelOrder)
    .delete("/order-destroy", destroyOrder)




module.exports = router 