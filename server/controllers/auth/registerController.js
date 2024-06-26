// @ts-check

const User = require("@model/User");
const bcrypt = require("bcrypt");
const { asyncWrapper } = require("@middleware/asyncWrapper");
const createError = require("http-errors");

/**
 * @typedef {import('@validations/authSchema').RegisterBody} RegisterBody
 */

const handleNewUser = asyncWrapper(async (req, res, next) => {
	/** @type {RegisterBody} */
	const { firstName, lastName, email, password, job, location } = req.body;

	// check for duplicate usernames in the db
	const duplicate = await User.findOne({ email });
	if (duplicate) return next(createError.Conflict("Email already in use")); //Conflict

	// create and store the new user
	const user = await User.create({
		firstName,
		lastName,
		email,
		password,
		job,
		location,
	});
	// Hash the password
	// @ts-ignore
	user.password = bcrypt.hashSync(password, 10);
	// Save user
	await user.save();

	// @ts-ignore
	res.status(201).json({ success: `New user ${user.fullName} created!`,user: user });
});

module.exports = { handleNewUser };
