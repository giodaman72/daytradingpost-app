# Academy video integration

## Supported providers

The provider-neutral adapter supports:

- YouTube through `youtube-nocookie.com`
- Vimeo through `player.vimeo.com`
- Mux playback from `stream.mux.com`
- Cloudflare Stream iframe playback from `videodelivery.net`
- HTTPS self-hosted video

Arbitrary embed HTML is never accepted. Provider IDs are validated and Mux or
Cloudflare playback hosts are rechecked at runtime even though Sanity also
validates them.

## Playback and resume

Video never autoplays. Native players expose browser captions, playback rate,
picture-in-picture, and fullscreen when supported. YouTube and Vimeo use their
privacy-oriented embed URLs. Saved positions are clamped to the known Sanity
duration and reset to the beginning when inside the final 10 percent.

## Progress

The player sends coarse checkpoints when at least ten seconds have changed and
on pause or completion. Server validation compares the position with the stored
lesson duration and keeps the maximum valid progress. Playback continues when a
checkpoint or analytics event fails.

The player emits `academy_video_started` and `academy_video_completed` without
including playback URLs or credentials.

## Captions and transcript

Native caption tracks use the Sanity label and language. A transcript disclosure
appears only when an authorized transcript exists. Caption or transcript
unavailability does not fabricate content and does not block the lesson.

## Private streaming limitation

No signing adapter or DRM claim exists in Part 2A. A future adapter must issue
short-lived server-authorized playback data without placing signing credentials
in Sanity, React props, URLs, or browser storage.
