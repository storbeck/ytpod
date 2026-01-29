import React from "react";

type Props = {
  track:
    | { id: string; title: string; artist: string; trackTitle: string; source: string }
    | undefined;
  index: number;
  total: number;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
};

export const NowPlayingScreen: React.FC<Props> = ({
  track,
  index,
  total,
  isPlaying,
  positionSeconds,
  durationSeconds,
}) => {
  const progressPct =
    durationSeconds > 0 ? Math.max(0, Math.min(100, (positionSeconds / durationSeconds) * 100)) : 0;

  const fmt = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "-:--";
    const minutes = Math.floor(secs / 60);
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${s}`;
  };

  return (
    <div className="lcd now-playing">
      <div className="lcd-body">
        <div className="lcd-subtle">
          {total > 0 ? `${index + 1} of ${total}` : "No playlist loaded"}
        </div>
        <div className="lcd-track-meta">
          {track
            ? `${track.artist} — ${track.trackTitle || track.title}`
            : "—"}
        </div>
        <div className="lcd-subtle">{track ? track.source : "—"}</div>
        <div className="lcd-subtle">{isPlaying ? "Playing" : "Paused"}</div>

        <div className="lcd-progress">
          <progress
            className="lcd-progress-bar"
            value={durationSeconds > 0 ? progressPct : 0}
            max={100}
            aria-label="Playback progress"
          />
        </div>
        <div className="lcd-time">
          <span>{fmt(positionSeconds)}</span>
          <span>{durationSeconds > 0 ? fmt(durationSeconds) : "-:--"}</span>
        </div>
      </div>
    </div>
  );
};
