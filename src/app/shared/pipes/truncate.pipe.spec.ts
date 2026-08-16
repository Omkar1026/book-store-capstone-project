import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('returns empty string for falsy input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('returns the value unchanged when shorter than limit', () => {
    expect(pipe.transform('Short', 50)).toBe('Short');
  });

  it('returns the value unchanged when exactly at limit', () => {
    const text = 'A'.repeat(50);
    expect(pipe.transform(text, 50)).toBe(text);
  });

  it('truncates and appends ellipsis when longer than limit', () => {
    const text = 'A'.repeat(55);
    const result = pipe.transform(text, 50);
    expect(result.endsWith('…')).toBeTrue();
    expect(result.length).toBe(51); // 50 chars + 1-char ellipsis
  });

  it('uses default limit of 50', () => {
    const text = 'A'.repeat(60);
    const result = pipe.transform(text);
    expect(result.startsWith('A'.repeat(50))).toBeTrue();
    expect(result.endsWith('…')).toBeTrue();
  });

  it('uses custom ellipsis', () => {
    const text = 'A'.repeat(60);
    const result = pipe.transform(text, 50, '...');
    expect(result.endsWith('...')).toBeTrue();
  });
});
