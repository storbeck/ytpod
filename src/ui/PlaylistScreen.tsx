import React from "react";

type Track = {
  id: string;
  title: string;
};

type Props = {
  tracks: Track[];
  currentIndex: number;
  onSelect: (index: number) => void;
  title?: string;
  emptyHint?: string;
  showControls?: boolean;
  presets?: { label: string; id: string }[];
  customId?: string;
  onChangeCustomId?: (value: string) => void;
  onLoadCustom?: () => void;
  onLoadPreset?: (id: string, label: string) => void;
};

export const PlaylistScreen: React.FC<Props> = ({
  tracks,
  currentIndex,
  onSelect,
  title = "Playlist",
  emptyHint = "Go to Settings to load a playlist.",
  showControls = false,
  presets = [],
  customId,
  onChangeCustomId,
  onLoadCustom,
  onLoadPreset,
}) => {
  return (
    <div className="lcd">
      <div className="lcd-titlebar">
        <div className="lcd-title">{title}</div>
      </div>

      <div className="lcd-list">
        {showControls && (
          <>
            {presets.length > 0 && (
              <div className="lcd-subtle lcd-subtle--mb-4">Presets</div>
            )}
            {presets.map((p) => (
              <button
                key={p.id}
                className="lcd-option"
                onClick={() => onLoadPreset && onLoadPreset(p.id, p.label)}
              >
                <span className="lcd-option-text">{p.label}</span>
              </button>
            ))}

            <div className="lcd-subtle lcd-subtle--mt-8">Custom playlist</div>
            <div className="lcd-form">
              <label className="lcd-label">
                URL or ID
                <input
                  className="lcd-input"
                  value={customId ?? ""}
                  onChange={(e) => onChangeCustomId && onChangeCustomId(e.target.value)}
                  placeholder="Paste YouTube playlist URL"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && onLoadCustom) {
                      onLoadCustom();
                    }
                  }}
                />
              </label>
              <button
                className="lcd-button"
                onClick={onLoadCustom}
                disabled={!onLoadCustom || !(customId && customId.trim())}
              >
                Load custom playlist
              </button>
            </div>
          </>
        )}

        {tracks.length > 0 && (
          <>
            {showControls && (
              <div className="lcd-subtle lcd-subtle--mt-8">Current playlist</div>
            )}
            {tracks.map((t, i) => (
              <button
                key={t.id + i}
                className={"lcd-option" + (i === currentIndex ? " selected" : "")}
                onClick={() => onSelect(i)}
              >
                <span className="lcd-option-text">{t.title}</span>
              </button>
            ))}
          </>
        )}
        {tracks.length === 0 && emptyHint && (
          <div className="lcd-empty">{emptyHint}</div>
        )}
      </div>
    </div>
  );
};
