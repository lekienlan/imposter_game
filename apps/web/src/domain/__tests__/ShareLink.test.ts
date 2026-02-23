import { describe, expect, test } from 'vitest';
import { buildShareUrl, parseShareInvite } from '../usecases/ShareLink';

describe('parseShareInvite', () => {
  test('parses ?code= param and uppercases it', () => {
    const result = parseShareInvite('?code=abcd');
    expect(result).toEqual({ roomId: 'ABCD' });
  });

  test('trims whitespace from code', () => {
    const result = parseShareInvite('?code=+AB CD+');
    expect(result?.roomId).toBe('AB CD');
  });

  test('returns null when no code param', () => {
    expect(parseShareInvite('')).toBeNull();
    expect(parseShareInvite('?foo=bar')).toBeNull();
  });

  test('does not parse legacy ?roomId= param', () => {
    expect(parseShareInvite('?roomId=ABCD')).toBeNull();
  });

  test('does not parse legacy ?hostName= param', () => {
    expect(parseShareInvite('?hostName=Alice')).toBeNull();
  });
});

describe('buildShareUrl', () => {
  test('builds URL with ?code= param', () => {
    const url = buildShareUrl('https://example.com', 'abcd');
    expect(url).toBe('https://example.com/?code=ABCD');
  });

  test('uppercases the room code', () => {
    const url = buildShareUrl('https://example.com', 'xyz1');
    expect(url).toContain('code=XYZ1');
  });

  test('does not include ?roomId= or ?hostName=', () => {
    const url = buildShareUrl('https://example.com', 'ROOM');
    expect(url).not.toContain('roomId');
    expect(url).not.toContain('hostName');
  });
});
