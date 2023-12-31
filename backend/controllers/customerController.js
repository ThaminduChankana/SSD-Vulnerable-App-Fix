const asyncHandler = require("express-async-handler");
const Customer = require("../models/customerModel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const CUSTOMER_SESSIONS = new Map();

// register  customer profile
const registerCustomer = asyncHandler(async (req, res) => {
	const { firstName, lastName, telephone, address, gender, country, email, password, pic } = req.body;
	const user = CUSTOMER_SESSIONS.get(req.cookies.sessionId);
	if (user == null) {
		res.sendStatus(401);
		return;
	}

	const customerExists = await Customer.findOne({ email });
	if (customerExists) {
		res.status(400);
		throw new Error("Customer Profile Exists !");
	}

	const customer = new Customer({
		firstName,
		lastName,
		telephone,
		address,
		gender,
		country,
		email,
		password,
		pic,
	});

	const salt = await bcrypt.genSalt(10);

	customer.password = await bcrypt.hash(password, salt);

	await customer.save();

	if (customer) {
		res.status(201).json({
			_id: customer._id,
			firstName: customer.firstName,
			lastName: customer.lastName,
			telephone: customer.telephone,
			address: customer.address,
			gender: customer.gender,
			country: customer.country,
			email: customer.email,
			pic: customer.pic,
			token: generateToken(customer._id),
		});
	} else {
		res.status(400);
		throw new Error("Customer Registration Failed !");
	}
});

//authenticate customer profile
const authCustomer = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const customer = await Customer.findOne({ email });

	if (!customer) {
		res.status(400);
		throw new Error("Invalid Email or Password");
	}

	const isMatch = await bcrypt.compare(password, customer.password);

	if (!isMatch) {
		res.status(400);
		throw new Error("Invalid Email or Password");
	} else {
		const sessionId = crypto.randomUUID();
		const csrfToken = crypto.randomUUID();

		const id = customer._id;
		CUSTOMER_SESSIONS.set(sessionId, { id, csrfToken });
		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 2);

		//Set the cookie
		res.cookie("sessionId", sessionId, {
			httpOnly: false,
			withCredentials: true,
			expires: expirationDate,
		});

		res.status(201).json({
			_id: customer._id,
			firstName: customer.firstName,
			lastName: customer.lastName,
			telephone: customer.telephone,
			address: customer.address,
			gender: customer.gender,
			country: customer.country,
			email: customer.email,
			pic: customer.pic,
			regDate: customer.regDate,
			token: generateToken(customer._id),
			csrfToken,
		});
	}
});

//get all of customers list
const getCustomers = asyncHandler(async (req, res) => {
	const customers = await Customer.find();
	res.json(customers);
});

// view customer profile by customer
const getCustomerProfile = asyncHandler(async (req, res) => {
	const customer = await Customer.findById(req.customer._id);

	if (customer) {
		res.json(customer);
	} else {
		res.status(400);
		throw new Error("Customer not found !");
	}
});

// view customer profile by admin
const getCustomerProfileById = asyncHandler(async (req, res) => {
	const customer = await Customer.findById(req.params._id);

	if (customer) {
		res.json(customer);
	} else {
		res.status(400);
		throw new Error("Customer not found !");
	}
});

//update customer profile by customer
const updateCustomerProfile = asyncHandler(async (req, res) => {
	const customer = await Customer.findById(req.customer._id);
	const user = CUSTOMER_SESSIONS.get(req.cookies.sessionId);
	if (user == null || user.csrfToken !== req.body.csrfToken) {
		res.sendStatus(401);
		return;
	}

	if (customer) {
		customer.firstName = req.body.firstName || customer.firstName;
		customer.lastName = req.body.lastName || customer.lastName;
		customer.telephone = req.body.telephone || customer.telephone;
		customer.address = req.body.address || customer.address;
		customer.gender = req.body.gender || customer.gender;
		customer.country = req.body.country || customer.country;
		customer.email = req.body.email || customer.email;
		customer.pic = req.body.pic || customer.pic;
		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			customer.password = await bcrypt.hash(req.body.password, salt);
		}
		const updatedCustomer = await customer.save();

		res.json({
			_id: updatedCustomer._id,
			firstName: updatedCustomer.firstName,
			lastName: updatedCustomer.lastName,
			telephone: updatedCustomer.telephone,
			address: updatedCustomer.address,
			gender: updatedCustomer.gender,
			country: updatedCustomer.country,
			email: updatedCustomer.email,
			pic: updatedCustomer.pic,
			regDate: updatedCustomer.regDate,
			token: generateToken(updatedCustomer._id),
		});
	} else {
		res.status(404);
		throw new Error("Customer Not Found !");
	}
});

//update customer profile by admin
const updateCustomerProfileById = asyncHandler(async (req, res) => {
	const customer = await Customer.findById(req.params._id);

	if (customer) {
		customer.firstName = req.body.firstName || customer.firstName;
		customer.lastName = req.body.lastName || customer.lastName;
		customer.telephone = req.body.telephone || customer.telephone;
		customer.address = req.body.address || customer.address;
		customer.gender = req.body.gender || customer.gender;
		customer.country = req.body.country || customer.country;
		customer.email = req.body.email || customer.email;
		customer.pic = req.body.pic || customer.pic;
		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			customer.password = await bcrypt.hash(req.body.password, salt);
		}
		const updatedCustomer = await customer.save();

		res.json({
			_id: updatedCustomer._id,
			firstName: updatedCustomer.firstName,
			lastName: updatedCustomer.lastName,
			telephone: updatedCustomer.telephone,
			address: updatedCustomer.address,
			gender: updatedCustomer.gender,
			country: updatedCustomer.country,
			email: updatedCustomer.email,
			pic: updatedCustomer.pic,
			regDate: updatedCustomer.regDate,
			token: generateToken(updatedCustomer._id),
		});
	} else {
		res.status(404);
		throw new Error("Customer Not Found !");
	}
});

// delete customer profile by  customer
const deleteCustomerProfile = asyncHandler(async (req, res) => {
	const customer = await Customer.findById(req.customer._id);

	const user = CUSTOMER_.get(req.cookies.sessionId);
	if (user == null) {
		res.sendStatus(401);
		return;
	}

	if (customer) {
		await customer.deleteOne();
		res.json({ message: "Customer Removed !" });
	} else {
		res.status(404);
		throw new Error("Customer not Found !");
	}
});

// delete customer profile by admin
const deleteCustomerProfileById = asyncHandler(async (req, res) => {
	const customer = await Customer.findById(req.params._id);

	if (customer) {
		await customer.deleteOne();
		res.json({ message: "Customer Removed !" });
	} else {
		res.status(404);
		throw new Error("Customer not Found !");
	}
});

// create csrf token
const getCSRF = asyncHandler(async (req, res) => {
	const sessionId = req.cookies.sessionId;
	// Check if the session exists in CUSTOMER_SESSIONS
	if (req.cookies.sessionId) {
		const newCsrfToken = crypto.randomUUID();

		// Assign the new CSRF token to the session object
		const session = CUSTOMER_SESSIONS.get(req.cookies.sessionId);
		session.csrfToken = newCsrfToken;

		res.json({ newCsrfToken });
	} else {
		res.status(400).json({ message: "Session not found" });
	}
});

module.exports = {
	CUSTOMER_SESSIONS,
	registerCustomer,
	authCustomer,
	getCustomers,
	getCustomerProfile,
	getCustomerProfileById,
	updateCustomerProfile,
	updateCustomerProfileById,
	deleteCustomerProfile,
	deleteCustomerProfileById,
	getCSRF,
};
