import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { fc } from 'fast-check';
import WaveformDisplay, { Slice } from './WaveformDisplay';

/**
 * Feature: waveform-rearrangement-display, Property 1: Rearranged buffer is used for rendering
 * Validates: Requirements 1.1, 1.4, 3.1
 */

// Helper to create a mock AudioBuffer
function createMockAudioBuffer(length: number, sampleRate: number = 44100): AudioBuffer {
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Fill with random data to make buffers distinguishable
    for (let i = 0; i < length; i++) {
        channelData[i] = Math.random() * 2 - 1;
    }

    return buffer;
}

// Arbitrary for generating slices
const sliceArbitrary = fc.record({
    id: fc.uuid(),
    sliceNumber: fc.integer({ min: 1, max: 16 }),
    sliceLabel: fc.string({ minLength: 1, maxLength: 3 }),
    colorHue: fc.integer({ min: 0, max: 360 }),
    duration: fc.float({ min: 0.1, max: 5.0 }),
    startTime: fc.float({ min: 0, max: 10 }),
    endTime: fc.float({ min: 0.1, max: 15 }),
});

describe('WaveformDisplay - Property-Based Tests', () => {
    it('Property 1: should use rearranged buffer for rendering when it exists', () => {
        fc.assert(
            fc.property(
                fc.array(sliceArbitrary, { minLength: 1, maxLength: 8 }),
                fc.integer({ min: 1000, max: 10000 }),
                fc.integer({ min: 1000, max: 10000 }),
                (slices, originalLength, rearrangedLength) => {
                    // Create two distinct audio buffers
                    const originalBuffer = createMockAudioBuffer(originalLength);
                    const rearrangedBuffer = createMockAudioBuffer(rearrangedLength);

                    // Calculate total duration from slices
                    const duration = slices.reduce((acc, s) => acc + s.duration, 0);

                    // Mock canvas context to track which buffer is used
                    const mockGetContext = vi.fn();
                    let usedBufferLength: number | null = null;

                    mockGetContext.mockReturnValue({
                        scale: vi.fn(),
                        fillStyle: '',
                        fillRect: vi.fn(),
                        strokeStyle: '',
                        lineWidth: 0,
                        beginPath: vi.fn(),
                        moveTo: vi.fn(),
                        lineTo: vi.fn(),
                        stroke: vi.fn(),
                    });

                    // Mock canvas element
                    const mockCanvas = {
                        getContext: mockGetContext,
                        getBoundingClientRect: () => ({ width: 800, height: 320 }),
                        width: 0,
                        height: 0,
                    };

                    // Mock document.createElement to return our mock canvas
                    const originalCreateElement = document.createElement.bind(document);
                    document.createElement = vi.fn((tagName: string) => {
                        if (tagName === 'canvas') {
                            return mockCanvas as any;
                        }
                        return originalCreateElement(tagName);
                    }) as any;

                    // Spy on getChannelData to track which buffer is accessed
                    const originalGetChannelData = originalBuffer.getChannelData.bind(originalBuffer);
                    const rearrangedGetChannelData = rearrangedBuffer.getChannelData.bind(rearrangedBuffer);

                    originalBuffer.getChannelData = vi.fn((channel: number) => {
                        usedBufferLength = originalBuffer.length;
                        return originalGetChannelData(channel);
                    });

                    rearrangedBuffer.getChannelData = vi.fn((channel: number) => {
                        usedBufferLength = rearrangedBuffer.length;
                        return rearrangedGetChannelData(channel);
                    });

                    // Render component with both buffers
                    const { unmount } = render(
                        <WaveformDisplay
                            audioBuffer={originalBuffer}
                            rearrangedBuffer={rearrangedBuffer}
                            slices={slices}
                            currentTime={0}
                            duration={duration}
                            selectedSliceId={null}
                            onSelectSlice={vi.fn()}
                            onSlicesReorder={vi.fn()}
                            onSliceDelete={vi.fn()}
                            onSliceDuplicate={vi.fn()}
                            onSliceClick={vi.fn()}
                        />
                    );

                    // Property: When rearranged buffer exists, it should be used for rendering
                    // We verify this by checking that the rearranged buffer's length was accessed
                    expect(usedBufferLength).toBe(rearrangedLength);
                    expect(rearrangedBuffer.getChannelData).toHaveBeenCalled();

                    unmount();

                    // Restore original createElement
                    document.createElement = originalCreateElement as any;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 1 (edge case): should use original buffer when rearranged buffer is null', () => {
        fc.assert(
            fc.property(
                fc.array(sliceArbitrary, { minLength: 1, maxLength: 8 }),
                fc.integer({ min: 1000, max: 10000 }),
                (slices, originalLength) => {
                    const originalBuffer = createMockAudioBuffer(originalLength);
                    const duration = slices.reduce((acc, s) => acc + s.duration, 0);

                    let usedBufferLength: number | null = null;

                    const mockGetContext = vi.fn();
                    mockGetContext.mockReturnValue({
                        scale: vi.fn(),
                        fillStyle: '',
                        fillRect: vi.fn(),
                        strokeStyle: '',
                        lineWidth: 0,
                        beginPath: vi.fn(),
                        moveTo: vi.fn(),
                        lineTo: vi.fn(),
                        stroke: vi.fn(),
                    });

                    const mockCanvas = {
                        getContext: mockGetContext,
                        getBoundingClientRect: () => ({ width: 800, height: 320 }),
                        width: 0,
                        height: 0,
                    };

                    const originalCreateElement = document.createElement.bind(document);
                    document.createElement = vi.fn((tagName: string) => {
                        if (tagName === 'canvas') {
                            return mockCanvas as any;
                        }
                        return originalCreateElement(tagName);
                    }) as any;

                    const originalGetChannelData = originalBuffer.getChannelData.bind(originalBuffer);
                    originalBuffer.getChannelData = vi.fn((channel: number) => {
                        usedBufferLength = originalBuffer.length;
                        return originalGetChannelData(channel);
                    });

                    const { unmount } = render(
                        <WaveformDisplay
                            audioBuffer={originalBuffer}
                            rearrangedBuffer={null}
                            slices={slices}
                            currentTime={0}
                            duration={duration}
                            selectedSliceId={null}
                            onSelectSlice={vi.fn()}
                            onSlicesReorder={vi.fn()}
                            onSliceDelete={vi.fn()}
                            onSliceDuplicate={vi.fn()}
                            onSliceClick={vi.fn()}
                        />
                    );

                    // Property: When rearranged buffer is null, original buffer should be used
                    expect(usedBufferLength).toBe(originalLength);
                    expect(originalBuffer.getChannelData).toHaveBeenCalled();

                    unmount();
                    document.createElement = originalCreateElement as any;
                }
            ),
            { numRuns: 100 }
        );
    });
});
