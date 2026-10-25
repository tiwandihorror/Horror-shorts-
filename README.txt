DAILY NIGHTMARE V4.1 — AI VIDEO FACTORY

V4.1 adds:
- Real Node.js backend and persistent production queue
- Scene-by-scene production manifests
- Provider adapter boundary via VIDEO_PROVIDER
- Daily automation hook via DAILY_AUTOMATION=true
- Render request endpoint
- Publishing boundary
- Mobile-friendly dashboard

RUN
---
Node.js 18+
npm start
Open http://localhost:3030

Daily queue:
DAILY_AUTOMATION=true npm start

IMPORTANT
---------
This is a real backend foundation, not a fake claim of an already-connected AI video service.
It intentionally does not invent third-party API contracts or expose API keys in the browser.

To make real videos, connect your chosen video/image provider, TTS, renderer (such as FFmpeg), storage, and approved social publishing APIs server-side.

NEXT: V4.2 can add a concrete provider adapter once the provider(s) are selected, plus rendering, captions, audio mixing, review and publishing.
