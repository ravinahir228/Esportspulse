
export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const data = await request.json();

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const message = String(data.message || "").trim();
    const token = String(data.token || "").trim();

    if (!name || !email || !message || !token) {
      return new Response(
        JSON.stringify({ success: false, error: "All fields are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify Cloudflare Turnstile
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token
        })
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Security verification failed."
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Send email through Resend
    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "EsportsPulse <contact@esportspulse.in>",
          to: ["esportspulse.in@gmail.com"],
          reply_to: email,
          subject: `New Contact Message from ${name}`,
          text:
            `Name: ${name}\n` +
            `Email: ${email}\n\n` +
            `Message:\n${message}`
        })
      }
    );

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to send email."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your message has been sent successfully."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Server error."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
