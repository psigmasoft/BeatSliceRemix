import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle } from './audioProcessor';

describe('fisherYatesShuffle', () => {
  it('should return an array with the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(arr);
    expect(result.length).toBe(arr.length);
  });

  it('should contain all original elements', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const result = fisherYatesShuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('should not modify the original array', () => {
    const arr = [1, 2, 3, 4];
    const arrCopy = [...arr];
    fisherYatesShuffle(arr);
    expect(arr).toEqual(arrCopy);
  });

  it('should produce different shuffles on different calls (very likely)', () => {
    const arr = Array.from({ length: 10 }, (_, i) => i);
    const shuffle1 = fisherYatesShuffle(arr);
    const shuffle2 = fisherYatesShuffle(arr);
    // Statistically, two shuffles of 10 elements should be different
    // (probability of being same is 1/10! which is negligible)
    expect(shuffle1).not.toEqual(shuffle2);
  });

  it('should handle single element arrays', () => {
    const arr = [42];
    const result = fisherYatesShuffle(arr);
    expect(result).toEqual([42]);
  });

  it('should handle empty arrays', () => {
    const arr: number[] = [];
    const result = fisherYatesShuffle(arr);
    expect(result).toEqual([]);
  });

  it('should work with complex objects', () => {
    const arr = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ];
    const result = fisherYatesShuffle(arr);
    expect(result.length).toBe(3);
    expect(result.map(item => item.id).sort()).toEqual([1, 2, 3]);
  });
});
