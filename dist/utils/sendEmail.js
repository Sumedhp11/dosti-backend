import { resend } from "../app.js";
const sendEmail = async (to, subject, code) => {
    try {
        await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to,
            subject,
            html: `<div><p>Code is ${code}</p> 
      <p>Thank You🚀</p></div> `,
        });
        return { success: true, message: "Email sent successfully" };
    }
    catch (error) {
        console.log(error);
        return { success: true, message: "Failed to send Email" };
    }
};
export { sendEmail };
