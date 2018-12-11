var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'atquarle@ncsu.edu',
    pass: 'tidkptsxkzupfelq'
  }
});

var mailOptions = {
  from: 'atquarle@ncsu.edu',
  to: 'atquarle@ncsu.edu',
  subject: 'WoW Market Report',
  text: ''
};

module.exports = {
    
    notify: function(message) {
        mailOptions.text = message;
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          }
        });
    }
}