/** Escape user-provided text before inserting it into HTML emails. */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const brand = {
  teal: '#0F4C5C',
  primary: '#003441',
  sand: '#F7F1E6',
  surface: '#FFF9EE',
  cinnamon: '#9C441E',
  gold: '#C9A24B',
  text: '#2B2B2B',
  muted: '#40484B',
}

/**
 * Shared, inline-styled email shell (email clients ignore <style> blocks and web fonts).
 */
export function layout(opts: { preheader: string; title: string; body: string; footer?: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.sand};font-family:Helvetica,Arial,sans-serif;color:${brand.text};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.sand};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(201,162,75,0.25);">
      <tr><td style="background:${brand.primary};padding:24px 32px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#ffffff;font-weight:bold;">Serendiva</div>
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9acee1;margin-top:4px;">Ceylon Private Journeys</div>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:30px;color:${brand.primary};margin:0 0 16px;">${esc(opts.title)}</h1>
        ${opts.body}
      </td></tr>
      <tr><td style="padding:20px 32px;background:${brand.surface};font-size:12px;line-height:18px;color:${brand.muted};">
        ${opts.footer ?? 'Serendiva · Licensed private tour guide in Sri Lanka'}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function p(text: string): string {
  return `<p style="font-size:15px;line-height:24px;margin:0 0 14px;">${text}</p>`
}

export function button(href: string, label: string, color = brand.cinnamon): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:8px;margin:4px 8px 4px 0;">${esc(label)}</a>`
}

/** Two-column details table; rows with empty values are skipped. */
export function detailsTable(rows: [string, string | null | undefined][]): string {
  const tr = rows
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;vertical-align:top;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${brand.muted};white-space:nowrap;">${esc(k)}</td><td style="padding:8px 0;font-size:15px;line-height:22px;">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-top:1px solid #ede8dd;margin:8px 0 20px;">${tr}</table>`
}

/** Plain-text version of a details table */
export function detailsText(rows: [string, string | null | undefined][]): string {
  return rows
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
}
