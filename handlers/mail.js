const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/* just to test mail sending
transport.sendMail({
  from: 'Eric Sproles <eric@eric.com>',
  to: 'randy@example.com',
  subject: 'Just teting',
  html: 'Hey this is the html test string',
  text: 'Hey this is the text string*'
});
*/

// go to pug, find password-reset.pug, generate it into HTML, then return it, pass it along to our mail options exports.send
const generateHTML = (filename, options = {}) => {
  html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html); // inlines your css with style tags in every paragraph
  return inlined;
}

exports.send = async (options) => { // reusable fn, just pass filename, subject, user who to send email to 
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: `Eric Sproles <noreply@esproles.com`,
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: text
  };
  const sendMail = promisify(transport.sendMail, transport)
  return sendMail(mailOptions);
};
