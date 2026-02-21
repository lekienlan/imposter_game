import { describe, test, expect, vi } from "vitest";

const createReconnectManager = (timeoutMs: number, onTimeout: () => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    onDisconnect() {
      timer = setTimeout(onTimeout, timeoutMs);
    },
    onReconnected() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
    getTimer() { return timer; },
  };
};

describe("reconnect logic", () => {
  test("clears timeout on successful reconnect", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const manager = createReconnectManager(30_000, onTimeout);
    manager.onDisconnect();
    manager.onReconnected();
    vi.advanceTimersByTime(30_000);
    expect(onTimeout).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test("calls onTimeout after 30s without reconnect", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const manager = createReconnectManager(30_000, onTimeout);
    manager.onDisconnect();
    vi.advanceTimersByTime(30_000);
    expect(onTimeout).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
