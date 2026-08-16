import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;

  beforeEach(() => {
    pipe = new TimeAgoPipe();
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns "just now" for a date less than 60 seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000);
    expect(pipe.transform(date)).toBe('just now');
  });

  it('returns minutes ago for a date 5 minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(pipe.transform(date)).toBe('5m ago');
  });

  it('returns hours ago for a date 3 hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('3h ago');
  });

  it('returns days ago for a date 2 days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('2d ago');
  });

  it('returns weeks ago for a date 2 weeks ago', () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('2w ago');
  });

  it('returns months ago for a date 3 months ago', () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('3mo ago');
  });

  it('returns years ago for a date 2 years ago', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('2y ago');
  });

  it('accepts an ISO string', () => {
    const date = new Date(Date.now() - 30 * 1000).toISOString();
    expect(pipe.transform(date)).toBe('just now');
  });
});
