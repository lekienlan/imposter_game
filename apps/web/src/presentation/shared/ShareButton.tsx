import { useState } from 'react';
import { Button } from 'pixel-retroui';
import { ShareModal } from './ShareModal';

interface Props {
  roomId: string;
}

export const ShareButton = ({ roomId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="arcade-btn share-btn-small"
        onClick={() => setIsOpen(true)}
        bg="var(--blue-400)"
        textColor="var(--neutral-black)"
        borderColor="var(--neutral-black)"
        shadow="var(--blue-700)"
      >
        SHARE
      </Button>
      {isOpen && <ShareModal roomId={roomId} onClose={() => setIsOpen(false)} />}
    </>
  );
};
