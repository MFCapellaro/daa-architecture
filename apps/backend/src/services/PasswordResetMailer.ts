import nodemailer from "nodemailer";

export interface PasswordResetMailer {
  assertConfigured(): void;
  sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void>;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

export function createSmtpPasswordResetMailer(): PasswordResetMailer {
  const assertConfigured = () => {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM are required");
    }
  };

  return {
    assertConfigured,
    async sendPasswordResetEmail(email, name, resetUrl) {
      assertConfigured();
      const port = Number(process.env.SMTP_PORT || "587");
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("SMTP_PORT must be a valid TCP port");
      }
      const secure = process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE.toLowerCase() === "true"
        : port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const safeName = escapeHtml(name);
      const safeUrl = escapeHtml(resetUrl);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Recuperar contraseña",
        text: `Hola ${name},\n\nPara crear una nueva contraseña, abre este enlace (válido durante 30 minutos):\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.`,
        html: `<p>Hola ${safeName},</p><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace es válido durante 30 minutos.</p><p><a href="${safeUrl}">Crear una nueva contraseña</a></p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
      });
    },
  };
}
