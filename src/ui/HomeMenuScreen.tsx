import React from "react";

export type HomeMenuKey = "nowPlaying" | "playlist" | "search" | "settings";

const items: Array<{ key: HomeMenuKey; label: string }> = [
  { key: "nowPlaying", label: "Now Playing" },
  { key: "playlist", label: "Playlist" },
  { key: "search", label: "Search" },
  { key: "settings", label: "Settings" },
];

type Props = {
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onActivate: (key: HomeMenuKey) => void;
};

export const HomeMenuScreen: React.FC<Props> = ({
  selectedIndex,
  onSelectIndex,
  onActivate,
}) => {
  return (
    <div className="lcd">
      <div className="lcd-titlebar">
        <div className="lcd-title">iPod</div>
        <div className="battery small" aria-hidden="true" />
      </div>

      <div className="lcd-menu">
        {items.map((item, idx) => {
          const selected = idx === selectedIndex;
          return (
            <button
              key={item.key}
              className={"lcd-option" + (selected ? " selected" : "")}
              onClick={() => {
                onSelectIndex(idx);
                onActivate(item.key);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

