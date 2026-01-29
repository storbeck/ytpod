# YTPod

<p align="center">
  <img src="build/icon.png" alt="YTPod icon" width="160" />
</p>

**YTPod** is a tiny iPod‑style desktop player for YouTube playlists and searches.

https://github.com/user-attachments/assets/531b5e7e-d3ec-486a-92fd-1e805af2d5d0

## Download (macOS)

Grab the latest build from GitHub Releases:

- https://github.com/storbeck/ytpod/releases/latest

## How to get a YouTube API key

You only need a key once — it’s stored locally.

1. Create a Google Cloud project.
2. Enable **YouTube Data API v3**.
3. Create an **API key**.
4. Paste it into **Settings → YouTube API key**.

Official instructions:
- https://developers.google.com/youtube/registering_an_application

## Build locally

```bash
npm install
npm run dist:mac
```
