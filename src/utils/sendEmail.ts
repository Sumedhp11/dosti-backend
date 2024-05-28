import { resend } from "../app.js";

const sendEmail = async (
  to: string,
  subject: string,
  code: string,
  expiryTime?: Date
) => {
  try {
    const now = new Date();
    const remainingTime = expiryTime
      ? Math.ceil((expiryTime.getTime() - now.getTime()) / 60000)
      : 0;

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject,
      html: `<div>
        <p>Code is ${code}</p>
        <p>The Code will expire in ${remainingTime} minutes</p> 
        <p>Thank You🚀</p>
      </div>`,
    });
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to send Email" };
  }
};

export { sendEmail };
