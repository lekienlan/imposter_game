import { Button } from 'pixel-retroui';
import { useShareModal } from '../../domain/utils/useShareModal';
import { ShareModal } from './ShareModal';

interface Props {
  shareUrl: string;
  roomId: string;
  shareCopied: boolean;
  onCopyLink: () => void;
}

export const ShareButton = ({ shareUrl, roomId, shareCopied, onCopyLink }: Props) => {
  const { isQrOpen, openQr, closeQr } = useShareModal();

  return (
    <>
      <div className="share-button-group">
        <Button
          type="button"
          className="arcade-btn"
          onClick={onCopyLink}
          bg="var(--pink-500)"
          textColor="var(--neutral-black)"
          borderColor="var(--neutral-black)"
          shadow="var(--pink-700)"
        >
          {shareCopied ? 'LINK COPIED' : 'COPY LINK'}
        </Button>
        <Button
          type="button"
          className="arcade-btn"
          onClick={openQr}
          bg="var(--yellow-400)"
          textColor="var(--neutral-black)"
          borderColor="var(--neutral-black)"
          shadow="var(--yellow-700)"
        >
          SHOW QR
        </Button>
      </div>
      {isQrOpen && <ShareModal shareUrl={shareUrl} roomId={roomId} onClose={closeQr} />}
    </>
  );
};
