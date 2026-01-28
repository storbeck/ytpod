import React from "react";

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  onSearch: () => void;
  searching: boolean;
  error: string | null;
};

export const SearchScreen: React.FC<Props> = ({
  query,
  onChangeQuery,
  onSearch,
  searching,
  error,
}) => {
  return (
    <div className="lcd">
      <div className="lcd-titlebar">
        <div className="lcd-title">Search</div>
        <div className="battery small" aria-hidden="true" />
      </div>

      <div className="lcd-form">
        <label className="lcd-label">
          Query
          <input
            className="lcd-input"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Song or artist"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
          />
        </label>

        <button
          className="lcd-button"
          onClick={onSearch}
          disabled={!query.trim() || searching}
        >
          {searching ? "Searching…" : "Search YouTube"}
        </button>

        {error && <div className="lcd-empty">{error}</div>}
        {!error && !searching && !query && (
          <div className="lcd-help">
            Type a song, artist, or video title and press Enter.
          </div>
        )}
      </div>
    </div>
  );
};

