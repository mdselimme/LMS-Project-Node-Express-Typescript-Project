import nodemailer from 'nodemailer'
import { envVars } from '../../config/envVariable.config'



export const sendEmail = async (to: string,subject:string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    port: 587,
    secure: envVars.NODE_ENV === 'production',
    auth: {
      user: envVars.provider_email,
      pass: envVars.provider_email_app_password
    }
  })

  await transporter.sendMail({
    from: envVars.provider_email, // sender address
    to, // list of receivers
    subject,
    text: '', // plain text body
    html // html body
  })
}