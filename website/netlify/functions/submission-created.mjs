/* ============================================================================
 * Auto-reply email — Raven Wikle Real Estate
 * ----------------------------------------------------------------------------
 * Netlify runs this automatically every time one of the site forms is
 * submitted (the filename "submission-created" is what wires it up).
 *
 * It sends the person who filled out the form a short branded thank-you email
 * from you, so nobody is left wondering whether it went through.
 *
 * TO TURN IT ON (about 10 minutes, free):
 *   1. Create a free account at https://resend.com
 *   2. Add and verify the domain you send from (ravenashleyhomes.com)
 *   3. Copy your API key
 *   4. In Netlify:  Site configuration → Environment variables → Add
 *        RESEND_API_KEY = re_xxxxxxxxxxxx
 *        FROM_EMAIL     = Raven Wikle <raven@ravenashleyhomes.com>
 *   5. Redeploy. Done.
 *
 * If those variables are not set, this function does nothing at all — your
 * forms keep working normally and you still get the notification email from
 * Netlify. Nothing breaks.
 * ========================================================================== */

const CELL = "757-408-1485";
const EMAIL = "raven@ravenashleyhomes.com";
const NAVY = "#41597A";

const SUBJECTS = {
  "buyer-inquiry":  "Thanks for reaching out — let's find your home",
  "seller-inquiry": "Thanks for reaching out — your Home Seller's Handbook",
  "home-valuation": "Your home valuation request — received",
  "saved-search":   "Your custom home search — on its way",
  "client-review":  "Thank you for the kind words",
};

const BODIES = {
  "buyer-inquiry":
    "Thank you for telling me what you're looking for. I've got your details in front of me and I'm already thinking about which listings fit.<br><br>" +
    "I'll be in touch shortly — usually the same day, always within one business day — with a few homes worth a look and a couple of questions to sharpen the search.",
  "seller-inquiry":
    "Thank you for sharing the details of your home. I'm putting together a look at what it could bring in today's market, and I'll send my Home Seller's Handbook along with it.<br><br>" +
    "Expect to hear from me shortly — usually the same day, always within one business day.",
  "home-valuation":
    "Thank you for requesting a home valuation. I don't use an automated estimate — I pull live comparable sales from both MLS boards and work through the numbers myself.<br><br>" +
    "You'll have a real range from me within one business day, with no obligation attached.",
  "saved-search":
    "Thank you — I'm setting up a saved search across both MLS boards using what you sent me.<br><br>" +
    "Once it's live, new listings that match will reach you the morning they hit the market, often before they show up on the big portals.",
  "client-review":
    "Thank you so much for taking the time to write that. Reviews are how most of my clients find me, and yours genuinely means a lot.<br><br>" +
    "I'll be in touch to say thank you properly.",
};

function template(name, body) {
  const hi = name ? `Hi ${name.split(" ")[0]},` : "Hello,";
  return `<!doctype html><html><body style="margin:0;background:#FBF9F6;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#3B4757;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E3E7EC;">
    <tr><td style="padding:38px 40px 30px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${NAVY};">Raven Wikle Real Estate</p>
      <hr style="border:0;border-top:1px solid #E3E7EC;margin:22px 0 26px;">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">${hi}</p>
      <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">${body}</p>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.7;">If anything comes up before then, call or text me directly at
        <a href="tel:+17574081485" style="color:${NAVY};text-decoration:none;font-weight:bold;">${CELL}</a>.</p>
      <p style="margin:0;font-size:16px;line-height:1.7;">Warmly,<br>Raven</p>
      <hr style="border:0;border-top:1px solid #E3E7EC;margin:30px 0 20px;">
      <p style="margin:0;font-size:12px;line-height:1.8;color:#6E7C8C;">
        Raven Wikle, REALTOR&reg; &middot; Virginia License #0225247151<br>
        Gloucester Realty Corp. &middot; 6528 Main Street, Gloucester, VA 23061<br>
        <a href="tel:+17574081485" style="color:#6E7C8C;">${CELL}</a> &middot;
        <a href="mailto:${EMAIL}" style="color:#6E7C8C;">${EMAIL}</a><br>
        Member: REIN and the Chesapeake Bay &amp; Rivers Association of REALTORS&reg;
      </p>
    </td></tr>
  </table>
</body></html>`;
}

export default async (req) => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("Auto-reply skipped: RESEND_API_KEY is not set.");
    return new Response("skipped", { status: 200 });
  }

  let payload;
  try {
    const parsed = await req.json();
    payload = parsed.payload || parsed;
  } catch (err) {
    console.log("Auto-reply skipped: could not read submission.", err);
    return new Response("skipped", { status: 200 });
  }

  const data = payload.data || {};
  const formName = payload.form_name || data["form-name"] || "";
  const to = data.Email || data.email || payload.email;
  if (!to) {
    console.log("Auto-reply skipped: no email address in submission.");
    return new Response("skipped", { status: 200 });
  }

  const subject = SUBJECTS[formName] || "Thanks for reaching out";
  const body = BODIES[formName] ||
    "Thank you for getting in touch. Your message came straight to my inbox and I'll reply personally, usually the same day.";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || `Raven Wikle <${EMAIL}>`,
        reply_to: EMAIL,
        to: [to],
        subject,
        html: template(data.Name || data.name || "", body),
      }),
    });
    if (!res.ok) console.log("Auto-reply failed:", res.status, await res.text());
    else console.log("Auto-reply sent to", to);
  } catch (err) {
    console.log("Auto-reply error:", err);
  }

  return new Response("ok", { status: 200 });
};
