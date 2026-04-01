import { resend, FROM } from './client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sixdegrees.link'

// ============================================================
// Types
// ============================================================

interface SendResult {
  id?: string
  error?: string
}

// ============================================================
// Magic link (called by Supabase Auth Hook — see docs)
// ============================================================

export async function sendMagicLink({
  to,
  magicLink,
}: {
  to: string
  magicLink: string
}): Promise<SendResult> {
  const { data, error } = await resend.emails.send({
    from: `SixDegrees <${FROM}>`,
    to,
    subject: 'Sign in to SixDegrees',
    html: magicLinkHtml({ magicLink }),
    text: magicLinkText({ magicLink }),
  })
  return error ? { error: error.message } : { id: data?.id }
}

// ============================================================
// Welcome email (sent after first sign-in)
// ============================================================

export async function sendWelcome({
  to,
  displayName,
}: {
  to: string
  displayName?: string
}): Promise<SendResult> {
  const name = displayName ?? 'contributor'
  const { data, error } = await resend.emails.send({
    from: `SixDegrees <${FROM}>`,
    to,
    subject: 'Welcome to SixDegrees',
    html: welcomeHtml({ name }),
    text: welcomeText({ name }),
  })
  return error ? { error: error.message } : { id: data?.id }
}

// ============================================================
// Requirement approved
// ============================================================

export async function sendRequirementApproved({
  to,
  requirementTitle,
  requirementId,
}: {
  to: string
  requirementTitle: string
  requirementId: string
}): Promise<SendResult> {
  const url = `${APP_URL}/requirements/${requirementId}`
  const { data, error } = await resend.emails.send({
    from: `SixDegrees <${FROM}>`,
    to,
    subject: `Your requirement was approved: ${requirementTitle}`,
    html: requirementApprovedHtml({ requirementTitle, url }),
    text: requirementApprovedText({ requirementTitle, url }),
  })
  return error ? { error: error.message } : { id: data?.id }
}

// ============================================================
// New comment notification
// ============================================================

export async function sendNewComment({
  to,
  requirementTitle,
  requirementId,
  commenterName,
  commentBody,
}: {
  to: string
  requirementTitle: string
  requirementId: string
  commenterName: string
  commentBody: string
}): Promise<SendResult> {
  const url = `${APP_URL}/requirements/${requirementId}#comments`
  const preview = commentBody.slice(0, 120) + (commentBody.length > 120 ? '…' : '')
  const { data, error } = await resend.emails.send({
    from: `SixDegrees <${FROM}>`,
    to,
    subject: `New comment on: ${requirementTitle}`,
    html: newCommentHtml({ requirementTitle, url, commenterName, preview }),
    text: newCommentText({ requirementTitle, url, commenterName, preview }),
  })
  return error ? { error: error.message } : { id: data?.id }
}

// ============================================================
// HTML templates (inline styles — email client safe)
// ============================================================

const styles = {
  body: 'background:#08090a;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;',
  container: 'max-width:560px;margin:40px auto;padding:0 24px;',
  card: 'background:#0f1011;border:1px solid #1c1e21;border-radius:12px;padding:32px;',
  h1: 'color:#f7f8f8;font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.02em;',
  p: 'color:#d0d6e0;font-size:15px;line-height:1.6;margin:0 0 16px;',
  button: 'display:inline-block;background:#e6e6e6;color:#08090a;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;',
  muted: 'color:#6b6f76;font-size:13px;line-height:1.5;margin:0;',
  divider: 'border:none;border-top:1px solid #1c1e21;margin:24px 0;',
  logo: 'color:#f7f8f8;font-size:16px;font-weight:590;text-decoration:none;letter-spacing:-0.02em;',
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${styles.body}">
  <div style="${styles.container}">
    <div style="padding:24px 0 16px;">
      <a href="${APP_URL}" style="${styles.logo}">SixDegrees</a>
    </div>
    <div style="${styles.card}">
      ${content}
    </div>
    <p style="padding:16px 0;${styles.muted}">
      You're receiving this because you have an account on SixDegrees.<br>
      <a href="${APP_URL}" style="color:#828fff;text-decoration:none;">sixdegrees.link</a>
    </p>
  </div>
</body>
</html>`
}

function magicLinkHtml({ magicLink }: { magicLink: string }): string {
  return baseLayout(`
    <h1 style="${styles.h1}">Sign in to SixDegrees</h1>
    <p style="${styles.p}">Click the button below to sign in. This link expires in 1 hour and can only be used once.</p>
    <p><a href="${magicLink}" style="${styles.button}">Sign in</a></p>
    <hr style="${styles.divider}">
    <p style="${styles.muted}">If you didn't request this, you can ignore this email. Someone may have typed your address by mistake.</p>
  `)
}

function magicLinkText({ magicLink }: { magicLink: string }): string {
  return `Sign in to SixDegrees\n\nClick the link below to sign in:\n${magicLink}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`
}

function welcomeHtml({ name }: { name: string }): string {
  return baseLayout(`
    <h1 style="${styles.h1}">Welcome to SixDegrees</h1>
    <p style="${styles.p}">Hey ${name} — you're in.</p>
    <p style="${styles.p}">SixDegrees is a free, open-source professional network built to replace LinkedIn. Every user is verified. No bots. No AI slop. No surveillance economy.</p>
    <p style="${styles.p}">Start by contributing a requirement — tell us what the platform needs to exist.</p>
    <p><a href="${APP_URL}/submit" style="${styles.button}">Contribute a requirement</a></p>
  `)
}

function welcomeText({ name }: { name: string }): string {
  return `Welcome to SixDegrees\n\nHey ${name} — you're in.\n\nStart by contributing a requirement at ${APP_URL}/submit`
}

function requirementApprovedHtml({ requirementTitle, url }: { requirementTitle: string; url: string }): string {
  return baseLayout(`
    <h1 style="${styles.h1}">Your requirement was approved</h1>
    <p style="${styles.p}">Your submission <strong style="color:#f7f8f8;">${requirementTitle}</strong> has been reviewed and approved. The community can now vote on it.</p>
    <p><a href="${url}" style="${styles.button}">View requirement</a></p>
  `)
}

function requirementApprovedText({ requirementTitle, url }: { requirementTitle: string; url: string }): string {
  return `Your requirement was approved\n\n"${requirementTitle}" has been approved and is now open for community voting.\n\nView it here: ${url}`
}

function newCommentHtml({ requirementTitle, url, commenterName, preview }: { requirementTitle: string; url: string; commenterName: string; preview: string }): string {
  return baseLayout(`
    <h1 style="${styles.h1}">New comment on your requirement</h1>
    <p style="${styles.p}"><strong style="color:#f7f8f8;">${commenterName}</strong> commented on <strong style="color:#f7f8f8;">${requirementTitle}</strong>:</p>
    <p style="background:#161718;border-left:3px solid #828fff;padding:12px 16px;border-radius:0 6px 6px 0;${styles.p}margin:0 0 20px;">${preview}</p>
    <p><a href="${url}" style="${styles.button}">View comment</a></p>
  `)
}

function newCommentText({ requirementTitle, url, commenterName, preview }: { requirementTitle: string; url: string; commenterName: string; preview: string }): string {
  return `New comment on: ${requirementTitle}\n\n${commenterName} said:\n"${preview}"\n\nView the full comment: ${url}`
}
