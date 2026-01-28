import React from "react";

type Props = {
  apiKey: string;
  onChangeApiKey: (value: string) => void;
};

export const SettingsScreen: React.FC<Props> = ({
  apiKey,
  onChangeApiKey,
}) => {
  return (
    <div className="lcd">
      <div className="lcd-titlebar">
        <div className="lcd-title">Settings</div>
        <div className="battery small" aria-hidden="true" />
      </div>

      <div className="lcd-form">
        <label className="lcd-label">
          API key
          <input
            className="lcd-input"
            value={apiKey}
            onChange={(e) => onChangeApiKey(e.target.value)}
            placeholder="YouTube API key"
          />
        </label>
        <div className="lcd-help">
          Your key is stored locally so you only set it once.
          <br />
          Choose playlists from the Playlist menu.
        </div>
      </div>
    </div>
  );
};

