import { QRCodeCanvas } from "qrcode.react";
import { Card } from "pixel-retroui";

interface Props {
  shareUrl: string;
  roomId: string;
  onClose: () => void;
}

const MAX_DISPLAY_LENGTH = 50;

const truncateUrl = (url: string): string => {
  if (url.length <= MAX_DISPLAY_LENGTH) return url;
  return url.slice(0, MAX_DISPLAY_LENGTH) + "...";
};

export const ShareModal = ({ shareUrl, roomId, onClose }: Props) => {
  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Card
          className="share-modal-card"
          bg="color-mix(in srgb, var(--surface-primary) 95%, var(--blue-900))"
          textColor="var(--neutral-white)"
          borderColor="var(--blue-500)"
          shadowColor="var(--blue-900)"
        >
          <div className="share-modal-content">
            <h2 className="share-modal-title">SCAN TO JOIN</h2>
            <p className="share-modal-room">ROOM: {roomId}</p>
            <div className="share-modal-qr">
              <QRCodeCanvas value={shareUrl} size={200} bgColor="#ffffff" fgColor="#000000" />
            </div>
            <p className="share-modal-url">{truncateUrl(shareUrl)}</p>
            <button className="share-modal-close" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
