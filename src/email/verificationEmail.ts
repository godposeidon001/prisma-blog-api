export function verificationEmailTemplate(name: string, link: string) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px 0;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
      
      <div style="background:#4f46e5; padding:20px; text-align:center;">
        <h1 style="color:white; margin:0;">Prisma Blog</h1>
      </div>

      <div style="padding:30px;">
        <h2>Verify your email</h2>

        <p>
          Hi ${name || "there"}, <br/><br/>
          Please verify your email by clicking the button below.
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a href="${link}" 
             style="background:#4f46e5;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;">
             Verify Email
          </a>
        </div>

        <p style="font-size:14px;color:#666;">
          If the button doesn't work, copy this link:
        </p>

        <p style="word-break:break-all;font-size:14px;">
          ${link}
        </p>
      </div>

      <div style="background:#f4f6f8;text-align:center;padding:15px;font-size:12px;color:#888;">
        © ${new Date().getFullYear()} Prisma Blog
      </div>

    </div>
  </div>
  `;
}