import { Button, Popup } from "pixel-retroui";

interface Props {
  word: string;
  role: string | null;
  onClose: () => void;
}

export const WordRevealPopup = ({ word, role, onClose }: Props) => (
  <Popup
    isOpen
    onClose={onClose}
    title="SECRET WORD"
    closeButtonText="X"
    className="arcade-word-popup"
    bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
    baseBg="var(--blue-900)"
    overlayBg="color-mix(in srgb, var(--neutral-black) 78%, transparent)"
    textColor="var(--yellow-300)"
    borderColor="var(--blue-500)"
  >
    <div className="arcade-popup-content">
      <p className="arcade-popup-word">{word}</p>
      <p className="arcade-popup-role">ROLE: {role ?? "HIDDEN"}</p>
      <Button
        type="button"
        className="arcade-btn"
        onClick={onClose}
        bg="var(--yellow-400)"
        textColor="var(--neutral-black)"
        borderColor="var(--neutral-black)"
        shadow="var(--yellow-700)"
      >
        READY
      </Button>
    </div>
  </Popup>
);
