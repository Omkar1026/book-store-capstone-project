import { CurrencyFormatPipe } from './currency-format.pipe';

describe('CurrencyFormatPipe', () => {
  let pipe: CurrencyFormatPipe;

  beforeEach(() => {
    pipe = new CurrencyFormatPipe();
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null as any)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(pipe.transform(NaN)).toBe('');
  });

  it('formats a number as INR currency by default', () => {
    const result = pipe.transform(1299);
    expect(result).toContain('1,299');
    expect(result).toContain('.00');
  });

  it('formats zero correctly', () => {
    const result = pipe.transform(0);
    expect(result).toContain('0.00');
  });

  it('formats with two decimal places', () => {
    const result = pipe.transform(19.99);
    expect(result).toContain('19.99');
  });

  it('uses the provided currency symbol', () => {
    const result = pipe.transform(100, 'USD', 'en-US');
    expect(result).toContain('$');
  });
});
