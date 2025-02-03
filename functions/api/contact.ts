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
  const mailgunApiUrl = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
  const authHeader = `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`;

  // Prepare email data for the admin
  const adminEmailData = new URLSearchParams({
    from: `NXZ <noreply@${env.MAILGUN_DOMAIN}>`,
    to: env.ADMIN_EMAIL,
    subject: `NXZ Contact Form Submission from ${name}`,
    text: `You received a new message from NXZ 
    name: ${name}\n\n
    company: ${company}\n\n
    email: ${email}\n\n
    message: ${message}`
  });

  // Prepare thank-you email data for the user
  // const userEmailData = new URLSearchParams({
  //   from: `Your Company <noreply@${env.MAILGUN_DOMAIN}>`,
  //   to: email,
  //   subject: 'Thank you for contacting us!',
  //   text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will respond shortly.\n\nBest regards,\nYour Company`,
  // });

  // Send both emails concurrently
  await Promise.all([
    fetch(mailgunApiUrl, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: adminEmailData,
    }),
    // fetch(mailgunApiUrl, {
    //   method: 'POST',
    //   headers: { Authorization: authHeader },
    //   body: userEmailData,
    // }),
  ]);
}
