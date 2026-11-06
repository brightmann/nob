// When YouTube embed HTML is pasted into the editor, TipTap's Link autolink
// wraps the URL inside the <iframe src="..."> in an <a> tag, leaving
// src="<a href="URL">URL</a>" — no browser can load that, so the video never
// shows. Repair it back to a clean src, and wrap bare YouTube iframes in the
// <div data-youtube-video> the Youtube extension parses, so they render as
// video nodes. Idempotent: already-canonical content passes through unchanged.
export const repairYoutubeEmbeds = (html: string): string => {
  const withCleanSrc = html.replaceAll(/src="<a[^>]*?href="([^"]+)"[^>]*>[^<]*<\/a>"/gi, 'src="$1"')

  return withCleanSrc.replaceAll(
    /(?<!<div data-youtube-video>)<iframe[^>]*src="https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/[^"]*"[^>]*>(?:<\/iframe>)?/gi,
    (iframe) => `<div data-youtube-video>${iframe}</div>`
  )
}
