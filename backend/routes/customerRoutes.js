const express = require("express");
const {
	registerCustomer,
	authCustomer,
	getCustomerProfile,
	updateCustomerProfile,
	deleteCustomerProfile,
	getCSRF,
} = require("../controllers/customerController");
const { protectCustomer } = require("../middleware/authCustomerMiddleware");
const router = express.Router();

//Routes for Customer Account Operations
router.route("/register").post(registerCustomer);
router.route("/login").post(authCustomer);
router.route("/view").get(protectCustomer, getCustomerProfile);
router.route("/edit").put(protectCustomer, updateCustomerProfile);
router.route("/delete").delete(protectCustomer, deleteCustomerProfile);

router.route("/get-csrf").get(getCSRF);

module.exports = router;
