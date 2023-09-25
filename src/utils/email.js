import nodemailer from "nodemailer";

class Email {
  constructor(email) {
    this.to = email;
    this.from = "olayemiayomide642@gmail.com";
  }
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST_2,
      port: 587,
      auth: {
        user: "olayemiayomide642@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
      secure: false,
    });
  }
  async send(subject, template) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      text: template,
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to this awesome website");
  }
  async resetPassword(template) {
    await this.send("Password Reset", template);
  }
}

export default Email;
