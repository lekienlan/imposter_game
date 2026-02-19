interface Props {
  word: string;
  role: string | null;
  onClose: () => void;
}

export const WordRevealPopup = ({ word, role, onClose }: Props) => (
  <div className="word-popup-backdrop" role="dialog" aria-modal="true" aria-label="Your secret keyword">
    <div className="word-popup-card">
      <p className="word-popup-kicker">Secret Word</p>
      <p className="word-popup-word">{word}</p>
      <p className="word-popup-role">Role: {role ?? "Hidden"}</p>
      <button className="btn btn-primary word-popup-close" onClick={onClose}>
        Got it
      </button>
    </div>
  </div>
);
