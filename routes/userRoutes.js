const { getAllUsers, registerUser, deleteUser, editUser, getSingleUsers, destroyUsers, getUserProfile } = require("../controllers/userController")
const { Protected } = require("../middlewares/auth")

const router = require("express").Router()
router
    .get("/", getAllUsers)
    .post("/register", registerUser)
    // .put("/update/:id", editUser)
    // .put("/profile-update/:id", Protected, editUser)
    .put("/profile-update", Protected, editUser)
    .delete("/delete/:id", deleteUser)
    .delete("/destroy", destroyUsers)
    .get("/profile", Protected, getUserProfile)
    .get("/:id", getSingleUsers)

module.exports = router 