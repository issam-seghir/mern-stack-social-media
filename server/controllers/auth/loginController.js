const User = require("@model/User");
const ResetToken = require("@model/ResetToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isProd } = require("@config/const");
const { getCookieOptions } = require("@config/cookieOptions");
const { ENV } = require("@/validations/envSchema");
const { asyncWrapper } = require("@middleware/asyncWrapper");
const createError = require("http-errors");
const mailer = require("@config/nodemailConfig");
const log = require("@/utils/chalkLogger");
const { generateResetToken } = require("@utils/index");

/**
 * @typedef {import('@validations/authSchema').LoginBody} LoginBody
 */

const handleLogin = asyncWrapper(async (req, res, next) => {
	/** @type {LoginBody} */
	const { email, password, rememberMe } = req.body;

	// verifie user existence in database
	const foundUser = await User.findOne({ email });
	if (!foundUser) return res.status(404).json({ field: "email", message: "User not found" });

	// evaluate password
	const match = await bcrypt.compare(password, foundUser.password);
	if (!match) return res.status(401).json({ field: "password", message: "Incorrect password" }); //Unauthorized

	// create JWT Refresh Token
	const newRefreshToken = jwt.sign(
		{
			id: foundUser._id.toString(),
			email: foundUser.email,
		},
		ENV.REFRESH_TOKEN_SECRET,
		{ expiresIn: rememberMe ? ENV.REFRESH_TOKEN_SECRET_EXPIRE_REMEMBER_ME : ENV.REFRESH_TOKEN_SECRET_EXPIRE }
	);

	// Saving refreshToken with current user in database
	foundUser.refreshToken = newRefreshToken;
	foundUser.rememberMe = rememberMe;
	await foundUser.save();

	// Creates Secure Cookie with refresh token
	//? Use the httpOnly flag to prevent JavaScript from reading it.
	//? Use the secure=true flag so it can only be sent over HTTPS.
	//? Use the SameSite=strict flag whenever possible to prevent CSRF. This can only be used if the Authorization Server has the same site as your front-end.
	res.cookie("jwt", newRefreshToken, getCookieOptions(rememberMe));

	// Create JWT Access Token
	const accessToken = jwt.sign(
		{
			id: foundUser._id.toString(),
			email: foundUser.email,
		},
		ENV.ACCESS_TOKEN_SECRET,
		{ expiresIn: rememberMe ? ENV.ACCESS_TOKEN_SECRET_EXPIRE_REMEMBER_ME : ENV.ACCESS_TOKEN_SECRET_EXPIRE }
	);

	// Send authorization roles and access token to user
	res.json({ success: `Login : ${foundUser.fullName}!`, token: accessToken, user: foundUser });
});

const checkEmailExists = asyncWrapper(async (req, res, next) => {
	const { email } = req.query;
	// verifie user existence in database
	const foundUser = await User.findOne({ email });
	res.json({ invalid: !foundUser });
});

/**
 * @typedef {import('@validations/authSchema').resetPasswordRequestBody} resetPasswordRequestBody
 */
//  Password reset flow
// Step 1: User requests a password reset
const resetPasswordRequest = asyncWrapper(async (req, res, next) => {
	/** @type {resetPasswordRequestBody} */
	const { email } = req.body;

	// Hash the reset token and set it in the user's document, along with an expiry time
	const user = await User.findOne({ email });
	if (!user) return res.status(404).json({ message: "No account with that email exists" });

	// Delete any existing reset tokens
	let token = await ResetToken.findOne({ userId: user._id });
	if (token) await token.deleteOne();

	// Generate a reset token
	const resetToken = generateResetToken();
	const hashedToken = await bcrypt.hash(resetToken, 10);

	// Create a new reset token document
	const tokenDocument = new ResetToken({
		userId: user._id,
		token: hashedToken,
		createdAt: Date.now(),
	});
	await tokenDocument.save();

	// use gmail account
	const resetPasswordlink = `${ENV.CLEINT_URL}/reset-password/${resetToken}`;
	const resetEmail = {
		to: user.email,
		from: `VipeTrip <${ENV.EMAIL_USERNAME}>`,
		subject: "Password Reset Request",
		html: `<img src="cid:logo.png" alt="logo"/>
		<h1>Welcome ${user.fullName}</h1>
		<p>You are receiving this because you (or someone else) have requested the <strong>reset of the password</strong> for your account.</p>
		<p>Please click on the following link, or paste this into your browser to complete the process:</p>
		<a href="${resetPasswordlink}">${resetPasswordlink}</a>
		<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
		attachments: [
			{
				filename: "image.png",
				path: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
				cid: "logo.png",
			},
		],
	};

	const mailInfo = await mailer.sendEmail(resetEmail);

	// use mailgun
	// const resetEmailMailgun = {
	// 	to: user.email,
	// 	from: `noreply@${ENV.MAILGUN_DOMIAN_NAME}`,
	// 	subject: "Password Reset Request",
	// 	template: "reset password",
	// 	"h:X-Mailgun-Variables": { test: "test" },
	// };

	// const mailgunInfo = await mailer.sendEmailMailgun(resetEmailMailgun);

	console.log("Message : %s", JSON.stringify(mailInfo));
	log.info(`An e-mail has been sent to ${user.email} with further instructions.`);
	res.status(200).send("Check your email for further instructions");
});

// Step 2: User enters a new password
const resetPassword = asyncWrapper(async (req, res, next) => {
	const { token } = req.params;
	const { password } = req.body;
	// Find the reset token document
	const tokenDocument = await ResetToken.findOne({ token });
	if (!tokenDocument) return res.status(404).send("Password reset token is invalid or has expired");

	// Find the user
	const user = await User.findById(tokenDocument.userId);
	if (!user) return res.status(404).send("Password reset token is invalid or has expired");

	// Verify the token
	const isValid = await bcrypt.compare(token, tokenDocument.token);
	if (!isValid) return res.status(400).send("Password reset token is invalid or has expired");

	// Hash the new password and update the user's password
	const hashedPassword = await bcrypt.hash(password, 10);
	user.password = hashedPassword;
	await user.save();

	// Delete the reset token document
	await tokenDocument.deleteOne();

	const resetEmail = {
		to: user.email,
		from: ENV.EMAIL_USERNAME,
		subject: "Password Reset Successfully",
		text: `
        Your password has been successfully reset. If you did not request this change, please contact our support immediately.
    `,
	};

	const mailInfo = await mailer.sendEmail(resetEmail);

	console.log("Message : %s", JSON.stringify(mailInfo));
	log.info(`An e-mail has been sent to ${user.email} with further instructions.`);
	res.status(200).send("Your password has been changed");
});

module.exports = { handleLogin, checkEmailExists, resetPasswordRequest, resetPassword };
