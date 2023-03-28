const { registerEmployee, getAllEmployees, getSingleEmployee, updateEmployee, deleteEmployee, destroyEmployees, adminGetAllUsers, adminUserActivation, adminStat } = require("../controllers/employeeController")
// const { adminProtected } = require("../middlewares/auth")

const router = require("express").Router()
router
    .get("/", getAllEmployees)
    .get("/profile", getSingleEmployee)
    .put("/update/:employeeId", updateEmployee)
    .delete("/delete/:employeeId", deleteEmployee)
    .post("/register", registerEmployee)
    .delete("/destroy", destroyEmployees)

    .get("/users", adminGetAllUsers)
    .get("/stat", adminStat)
    .put("/users/status/:userId", adminUserActivation)


module.exports = router 