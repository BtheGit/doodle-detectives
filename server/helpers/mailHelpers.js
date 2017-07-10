const nodemailer					= require('nodemailer'),
			juice 							= require('juice'), //	//Juice inlines the CSS into the HTML from ext stylesheets
			promisify 					= require('es6-promisify'),
			ejs 								= require('ejs'),
			htmlToText 					= require('html-to-text')

//Configure email transport type (typically SMTP)
const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});

//using ejs library to convert template back into regular html for email embedding
const generateHTML = (filename, options = {}) => {
	const html = ejs.renderFile(__dirname + '/../views/templates/email/password-reset.ejs', options, (err, body) => {
		if(err) console.log(err);
		return body;
	});
	//Juice is a library that takes separate stylesheet and inlines the CSS into the HTML
	const inlined = juice(html)
	return inlined;
}

exports.send = async (options) => {
	//create HTML and regular text versions of email templates
	const html = generateHTML(options.filename, options);
	const text = htmlToText.fromString(html);

	const mailOptions = {
		from: 'mysite@domain.com',
		to: options.user.email,
		subject: options.subject,
		html,
		text
	};

	//need to promisify nodemailer sendmail method on our transport object
	const sendMail = promisify(transport.sendMail, transport)
	//execute and return
	return sendMail(mailOptions);
}

//EXAMPLE HOW TO SEND MAIL
// transport.sendMail({
// 	from: 'br@gmail.com',
// 	to: 'bren@gmail.com',
// 	subject: 'Testing 1',
// 	html: 'BODY TEXT',
// 	text: 'TEXT TEST'
// })