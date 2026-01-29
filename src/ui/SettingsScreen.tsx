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
      </div>

      <div className="lcd-form">
        <label className="lcd-label">
          YouTube API key
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
          <a
            href="https://developers.google.com/youtube/registering_an_application"
            target="_blank"
            rel="noreferrer"
          >
            Get instructions
          </a>
        </div>
      </div>
    </div>
  );
};
