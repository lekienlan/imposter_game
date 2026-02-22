import { useTranslation } from "react-i18next";

export const RoomDisbandedBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="arcade-reconnect-banner" role="status" aria-live="polite">
      {t("room.disbanded")}
    </div>
  );
};
