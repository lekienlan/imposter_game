import { useState } from "react";

export const useShareModal = () => {
  const [isQrOpen, setIsQrOpen] = useState(false);

  const openQr = () => setIsQrOpen(true);
  const closeQr = () => setIsQrOpen(false);

  return { isQrOpen, openQr, closeQr };
};
