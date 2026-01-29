import React from "react";

type Props = {
  topScreen: React.ReactNode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onMenu: () => void;
  onCenter: () => void;
};

export const IPodShell: React.FC<Props> = ({
  topScreen,
  onPlayPause,
  onNext,
  onPrev,
  onMenu,
  onCenter,
}) => {
  const handleMinimize = () => {
    try {
      (window as any)?.electronAPI?.minimize?.();
    } catch {
      // no-op
    }
  };

  const handleClose = () => {
    try {
      (window as any)?.electronAPI?.close?.();
    } catch {
      // no-op
    }
  };

  return (
    <div className="ipod-shell">
      <div className="ipod ipod-small">
        <div className="window-controls">
          <button
            className="window-control window-control--close"
            onClick={handleClose}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
          <button
            className="window-control window-control--min"
            onClick={handleMinimize}
            aria-label="Minimize"
            title="Minimize"
          >
            &minus;
          </button>
        </div>
        <div className="ipod-screen-frame">
          <div className="ipod-lcd">
            {topScreen}
          </div>
        </div>

        <div className="outer-ring">
          <div className="touch-wheel" role="group" aria-label="iPod controls">
            <button className="wheel-hit wheel-menu" onClick={onMenu} aria-label="Menu">
              MENU
            </button>

            <button
              className="wheel-hit wheel-prev"
              onClick={onPrev}
              aria-label="Previous"
              title="Previous"
            >
              <span className="skip back" />
            </button>

            <button
              className="wheel-hit wheel-next"
              onClick={onNext}
              aria-label="Next"
              title="Next"
            >
              <span className="skip forward" />
            </button>

            <button
              className="wheel-hit wheel-playpause"
              onClick={onPlayPause}
              aria-label="Play/Pause"
              title="Play/Pause"
            >
              <span className="play-pause" />
            </button>

            <button
              className="center-button"
              onClick={onCenter}
              aria-label="Select"
              title="Select"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
