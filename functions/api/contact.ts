import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";


export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse incoming request body
    const { name, email, company, message } = await request.json();

    // Validate form data separately
    const validationError = validateFormData({ name, email, company, message });
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, error: validationError }),
        { status: 400 }
      );
    }

    // Send emails using a dedicated function
    await sendEmails({ name, email, company, message }, env);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error.' }),
      { status: 500 }
    );
  }
}

/**
 * Validates the form input.
 * Returns an error message string if validation fails;
 * otherwise, returns null.
 */
function validateFormData({ name, email, company, message }) {
  if (!name || !email || !company || !message) {
    return 'All fields are required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address.';
  }
  return null;
}

/**
 * Sends emails via Mailgun.
 * Sends one email to the admin and one thank-you email to the user.
 */
async function sendEmails({ name, email, company, message }, env) {


  const msg = createMimeMessage();
   msg.setSender({ name: "NXZ Contact", addr: "contact@nxz.ai" });
   msg.setRecipient("calmlikemoon@gmail.com");
   msg.setSubject(`NXZ Contact Form Submission from ${name}`);
   msg.addMessage({
       contentType: 'text/plain',
       data: `You received a new message from NXZ 
    name: ${name}\n\n
    company: ${company}\n\n
    email: ${email}\n\n
    message: ${message}`
   });

   var message = new EmailMessage(
     "contact@nxz.ai",
     "calmlikemoon@gmail.com",
     msg.asRaw()
   );
   try {
     await env.SEB.send(message);
   } catch (e) {
     throw e
   }
}
