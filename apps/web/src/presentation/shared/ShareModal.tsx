import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button, Card } from 'pixel-retroui';
import { buildShareUrl, resolveShareOrigin } from '../../domain/usecases/ShareLink';

interface Props {
  roomId: string;
  onClose: () => void;
}

export const ShareModal = ({ roomId, onClose }: Props) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { origin } = resolveShareOrigin(
    window.location.origin,
    import.meta.env.VITE_SHARE_ORIGIN as string | undefined,
  );
  const shareUrl = buildShareUrl(origin, roomId);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

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
            <h2 className="share-modal-title">SHARE ROOM</h2>
            <div className="share-options-list">
              <Button
                type="button"
                className="arcade-btn"
                onClick={copyCode}
                bg="var(--blue-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--blue-700)"
              >
                {copiedCode ? 'COPIED!' : 'COPY CODE'}
              </Button>
              <Button
                type="button"
                className="arcade-btn"
                onClick={copyLink}
                bg="var(--pink-500)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--pink-700)"
              >
                {copiedLink ? 'COPIED!' : 'COPY LINK'}
              </Button>
            </div>
            <div className="share-modal-qr">
              <QRCodeCanvas value={shareUrl} size={180} bgColor="#ffffff" fgColor="#000000" />
            </div>
            <button className="share-modal-close" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
