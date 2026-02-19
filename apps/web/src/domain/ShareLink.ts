export interface ShareInvite {
  roomId: string;
  hostName: string;
}

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export const isLocalhostOrigin = (origin: string): boolean => {
  try {
    const parsed = new URL(origin);
    return LOCALHOST_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
};

export const resolveShareOrigin = (
  currentOrigin: string,
  shareOriginEnv?: string
): { origin: string; error?: string } => {
  if (!isLocalhostOrigin(currentOrigin)) {
    return { origin: currentOrigin };
  }

  const configuredOrigin = shareOriginEnv?.trim();
  if (!configuredOrigin) {
    return {
      origin: currentOrigin,
      error: "Thiếu VITE_SHARE_ORIGIN để share sang máy khác khi chạy localhost."
    };
  }

  try {
    const parsed = new URL(configuredOrigin);
    return { origin: parsed.origin };
  } catch {
    return {
      origin: currentOrigin,
      error: "VITE_SHARE_ORIGIN không hợp lệ. Ví dụ: http://192.168.1.23:5173"
    };
  }
};

export const buildShareUrl = (origin: string, roomId: string, hostName: string): string => {
  const url = new URL("/", origin);
  url.searchParams.set("roomId", roomId.toUpperCase());
  url.searchParams.set("hostName", hostName);
  return url.toString();
};

export const parseShareInvite = (search: string): ShareInvite | null => {
  const params = new URLSearchParams(search);
  const roomId = params.get("roomId")?.trim().toUpperCase();
  if (!roomId) {
    return null;
  }

  const hostName = params.get("hostName")?.trim() ?? "";
  return { roomId, hostName };
};
