import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5144264cc5df10",
    pass: "50697295cd4669"
  }
});