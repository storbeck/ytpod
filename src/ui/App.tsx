import React, { useEffect, useRef, useState } from "react";
import { IPodShell } from "./IPodShell";
import { PlaylistScreen } from "./PlaylistScreen";
import { NowPlayingScreen } from "./NowPlayingScreen";
import { HomeMenuScreen, type HomeMenuKey } from "./HomeMenuScreen";
import { SettingsScreen } from "./SettingsScreen";
import { SearchScreen } from "./SearchScreen";

type Track = {
  id: string;
  title: string;
};

type Screen = "menu" | "nowPlaying" | "playlist" | "search" | "settings";

const PRESET_PLAYLISTS: { label: string; id: string }[] = [
  { label: "Chill Lofi Beats", id: "chill lofi hip hop mix" },
  { label: "Jazz Vibes", id: "jazz vibes playlist" },
  { label: "Synthwave / Retrowave", id: "synthwave retrowave mix" },
  { label: "Indie Mix", id: "indie rock mix" },
];

export const App: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuIndex, setMenuIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState("Playlist");
  const [playlistEmptyHint, setPlaylistEmptyHint] = useState(
    "Go to Settings to load a playlist.",
  );
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any | null>(null);
  const lastLoadedIdRef = useRef<string | null>(null);

  // Load saved API key once on startup so user doesn't have to re-enter it.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ytpod.apiKey");
      if (saved) {
        setApiKey(saved);
      }
    } catch (e) {
      // Ignore storage errors; app still works without persistence.
      console.warn("Unable to read saved API key", e);
    }
  }, []);

  // Persist API key whenever it changes.
  useEffect(() => {
    try {
      if (apiKey) {
        window.localStorage.setItem("ytpod.apiKey", apiKey);
      } else {
        window.localStorage.removeItem("ytpod.apiKey");
      }
    } catch (e) {
      console.warn("Unable to persist API key", e);
    }
  }, [apiKey]);

  // Initialize YouTube IFrame Player API
  useEffect(() => {
    function initPlayer() {
      const YTNS = (window as any).YT;
      if (YTNS && YTNS.Player && !playerRef.current) {
        playerRef.current = new YTNS.Player("yt-audio", {
          height: "0",
          width: "0",
          videoId: "",
          playerVars: {
            controls: 0,
            modestbranding: 1,
            playsinline: 1,
            ...(window.location.protocol.startsWith("http")
              ? { origin: window.location.origin }
              : {}),
          },
          events: {
            onReady: (event: any) => {
              setPlayerReady(true);
              try {
                const iframe = event?.target?.getIframe?.();
                if (iframe) {
                  iframe.setAttribute("allow", "autoplay; encrypted-media");
                }
              } catch {
                // ignore
              }
            },
            onError: (event: any) => {
              console.warn("YouTube player error", event?.data);
            },
          },
        });
        return true;
      }
      return false;
    }

    if (!initPlayer()) {
      // Wait for YouTube API to load
      const checkInterval = setInterval(() => {
        if (initPlayer()) {
          clearInterval(checkInterval);
        }
      }, 500);

      return () => clearInterval(checkInterval);
    }
  }, []);

  // Load video when track changes and player is ready
  useEffect(() => {
    const track = tracks[currentIndex];
    if (!track || !playerReady || !playerRef.current) return;

    const player = playerRef.current;
    if (typeof player.loadVideoById === "function") {
      try {
        player.loadVideoById(track.id);
        lastLoadedIdRef.current = track.id;
        setPositionSeconds(0);
        setDurationSeconds(0);
      } catch (e) {
        console.warn("Failed to load video", e);
      }
    }
  }, [tracks, currentIndex, playerReady]);

  // Sync play / pause with player
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    const player = playerRef.current;
    if (isPlaying) {
      try {
        if (typeof player.playVideo === "function") {
          player.playVideo();
        }
      } catch {
        // ignore
      }
    } else {
      try {
        if (typeof player.pauseVideo === "function") {
          player.pauseVideo();
        }
      } catch {
        // ignore
      }
    }
  }, [isPlaying, playerReady]);

  // Poll for current time / duration while a track is loaded
  useEffect(() => {
    const track = tracks[currentIndex];
    if (!track || !playerReady || !playerRef.current) return;
    const player = playerRef.current;

    const id = setInterval(() => {
      try {
        if (typeof player.getCurrentTime === "function") {
          const current = player.getCurrentTime();
          if (typeof current === "number" && !Number.isNaN(current)) {
            setPositionSeconds(current);
          }
        }
        if (typeof player.getDuration === "function") {
          const dur = player.getDuration();
          if (typeof dur === "number" && !Number.isNaN(dur)) {
            setDurationSeconds(dur);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 500);

    return () => clearInterval(id);
  }, [tracks, currentIndex, playerReady]);

  const resolvePlaylistId = (raw: string): string => {
    let value = raw.trim();
    try {
      if (value.includes("youtube.com") || value.includes("youtu.be")) {
        const url = new URL(value);
        const listParam = url.searchParams.get("list");
        if (listParam) {
          value = listParam;
        }
      }
    } catch {
      // fall back to raw value if URL parsing fails
    }
    return value;
  };

  const loadPlaylist = async (rawId: string, label: string) => {
    if (!apiKey || !rawId.trim()) return;
    const effectivePlaylistId = resolvePlaylistId(rawId);
    const collected: Track[] = [];
    let pageToken = "";

    try {
      while (true) {
        const params = new URLSearchParams({
          part: "snippet,contentDetails",
          maxResults: "50",
          playlistId: effectivePlaylistId,
          key: apiKey,
        });
        if (pageToken) params.append("pageToken", pageToken);

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
        );
        const json = await res.json();
        if (!json.items) break;

        for (const item of json.items) {
          const videoId = item.contentDetails?.videoId;
          const title = item.snippet?.title;
          if (videoId && title) {
            collected.push({ id: videoId, title });
          }
        }

        if (json.nextPageToken) {
          pageToken = json.nextPageToken;
        } else {
          break;
        }
      }

      setTracks(collected);
      setCurrentIndex(0);
      setIsPlaying(true);
      setPlaylistTitle(label);
      setPlaylistEmptyHint(
        collected.length ? "" : "No videos found in this playlist.",
      );
      setScreen("playlist");
    } catch (e) {
      console.error("Failed to load playlist", e);
    }
  };

  const runSearchFor = async (query: string, title: string) => {
    if (!apiKey || !query.trim()) return;
    setSearching(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        part: "snippet",
        maxResults: "20",
        q: query,
        type: "video",
        key: apiKey,
      });

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      );
      const json = await res.json();

      if (!json.items || !Array.isArray(json.items) || json.items.length === 0) {
        setSearchError("No results. Try a different search.");
        return;
      }

      const results: Track[] = json.items
        .map((item: any) => {
          const videoId = item.id?.videoId;
          const title = item.snippet?.title;
          if (!videoId || !title) return null;
          return { id: videoId, title };
        })
        .filter(Boolean) as Track[];

      if (results.length === 0) {
        setSearchError("No playable results found.");
        return;
      }

      setTracks(results);
      setCurrentIndex(0);
      setIsPlaying(false);
      setPlaylistTitle(title);
      setPlaylistEmptyHint("No results. Try a different search.");
      setScreen("playlist");
    } catch (e) {
      console.error("Search failed", e);
      setSearchError("Search failed. Check your API key or try again.");
    } finally {
      setSearching(false);
    }
  };

  const runSearch = async () => {
    return runSearchFor(searchQuery, "Search results");
  };

  const currentTrack = tracks[currentIndex];

  const handlePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (!nextPlaying || !playerReady || !playerRef.current) return;
    const track = tracks[currentIndex];
    if (!track) return;
    const player = playerRef.current;
    try {
      if (lastLoadedIdRef.current !== track.id && typeof player.loadVideoById === "function") {
        player.loadVideoById(track.id);
        lastLoadedIdRef.current = track.id;
      }
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const handleNext = () => {
    if (screen === "menu") {
      setMenuIndex((i) => Math.min(i + 1, 3));
      return;
    }
    const nextIndex = (currentIndex + 1) % Math.max(tracks.length, 1);
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    if (!playerReady || !playerRef.current) return;
    const track = tracks[nextIndex];
    if (!track) return;
    const player = playerRef.current;
    try {
      if (typeof player.loadVideoById === "function") {
        player.loadVideoById(track.id);
        lastLoadedIdRef.current = track.id;
      }
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const handlePrev = () => {
    if (screen === "menu") {
      setMenuIndex((i) => Math.max(i - 1, 0));
      return;
    }
    const nextIndex =
      (currentIndex - 1 + Math.max(tracks.length, 1)) % Math.max(tracks.length, 1);
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    if (!playerReady || !playerRef.current) return;
    const track = tracks[nextIndex];
    if (!track) return;
    const player = playerRef.current;
    try {
      if (typeof player.loadVideoById === "function") {
        player.loadVideoById(track.id);
        lastLoadedIdRef.current = track.id;
      }
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const handleMenu = () => {
    setScreen("menu");
  };

  const handleCenter = () => {
    if (screen !== "menu") return;
    const keyOrder: HomeMenuKey[] = ["nowPlaying", "playlist", "search", "settings"];
    const index = Math.max(0, Math.min(menuIndex, keyOrder.length - 1));
    setScreen(keyOrder[index]);
  };

  const handleSelectTrack = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    setScreen("nowPlaying");
    if (!playerReady || !playerRef.current) return;
    const track = tracks[index];
    if (!track) return;
    const player = playerRef.current;
    try {
      if (typeof player.loadVideoById === "function") {
        player.loadVideoById(track.id);
        lastLoadedIdRef.current = track.id;
      }
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {
      // ignore
    }
  };

  const activateMenuKey = (key: HomeMenuKey) => {
    setScreen(key);
  };

  const handleLoadPreset = (id: string, label: string) => {
    // Treat preset "id" as a search query for robustness, so we don't depend
    // on specific playlist IDs that might disappear.
    // Append "music" to the query to get better music results (not shown in UI).
    runSearchFor(`${id} music`, label);
  };

  const handleLoadCustom = () => {
    if (!playlistId.trim()) return;
    loadPlaylist(playlistId, "Custom playlist");
  };

  return (
    <div className="app-root">
      <IPodShell
        topScreen={
          screen === "menu" ? (
            <HomeMenuScreen
              selectedIndex={menuIndex}
              onSelectIndex={setMenuIndex}
              onActivate={activateMenuKey}
            />
          ) : screen === "search" ? (
            <SearchScreen
              query={searchQuery}
              onChangeQuery={setSearchQuery}
              onSearch={runSearch}
              searching={searching}
              error={searchError}
            />
          ) : screen === "settings" ? (
            <SettingsScreen
              apiKey={apiKey}
              onChangeApiKey={setApiKey}
            />
          ) : screen === "playlist" ? (
            <PlaylistScreen
              tracks={tracks}
              currentIndex={currentIndex}
              onSelect={handleSelectTrack}
              title={playlistTitle}
              emptyHint={playlistEmptyHint}
              showControls
              presets={PRESET_PLAYLISTS}
              customId={playlistId}
              onChangeCustomId={setPlaylistId}
              onLoadCustom={handleLoadCustom}
              onLoadPreset={handleLoadPreset}
            />
          ) : (
            <NowPlayingScreen
              track={currentTrack}
              index={currentIndex}
              total={tracks.length}
              isPlaying={isPlaying}
              positionSeconds={positionSeconds}
              durationSeconds={durationSeconds}
            />
          )
        }
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onMenu={handleMenu}
        onCenter={handleCenter}
      />

      {/* Hidden audio iframe host (player replaces this with an iframe). */}
      <div id="yt-audio" className="hidden-audio" />
    </div>
  );
};
