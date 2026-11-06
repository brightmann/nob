// When YouTube embed HTML is pasted into the editor, TipTap has no video node,
// so the <iframe> tags arrive as escaped text (&lt;iframe ... &gt;) while the
// Link autolink wraps the URL inside the src in a real <a> tag, leaving
// src="<a href="URL">URL</a>" — no browser can load that, so the video never
// shows. Repair it in three passes: unescape the YouTube iframe block, clean
// the mangled src, and wrap the iframe in the <div data-youtube-video> the
// Youtube extension parses, so it renders as a video node. Idempotent:
// already-canonical content passes through unchanged, and non-YouTube
// <iframe> text is left alone.
export const repairYoutubeEmbeds = (html: string): string => {
  const withRealIframes = html.replaceAll(/&lt;iframe.*?&gt;.*?&lt;\/iframe&gt;/gis, (block) =>
    /youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\//i.test(block)
      ? block.replaceAll('&lt;', '<').replaceAll('&gt;', '>')
      : block
  )

  const withCleanSrc = withRealIframes.replaceAll(/src="<a[^>]*?href="([^"]+)"[^>]*>[^<]*<\/a>"/gi, 'src="$1"')

  return withCleanSrc.replaceAll(
    /(?<!<div data-youtube-video>)<iframe[^>]*src="https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/[^"]*"[^>]*>(?:<\/iframe>)?/gi,
    (iframe) => `<div data-youtube-video>${iframe}</div>`
  )
}
