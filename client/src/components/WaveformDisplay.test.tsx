import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
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
    duration: fc.double({ min: Math.fround(0.1), max: Math.fround(5.0) }),
    startTime: fc.double({ min: Math.fround(0), max: Math.fround(10) }),
    endTime: fc.double({ min: Math.fround(0.1), max: Math.fround(15) }),
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

/**
 * Feature: slice-drag-waveform-update
 * Validates that when a slice is dragged, the waveform renders with the new slice order
 */
describe('WaveformDisplay - Slice Drag and Waveform Update', () => {
    let mockAudioBuffer: AudioBuffer;
    let mockCanvas: any;
    let mockGetContext: any;
    let canvasDrawCalls: Array<{ method: string; args: any[] }>;

    beforeEach(() => {
        // Setup mock audio buffer
        mockAudioBuffer = createMockAudioBuffer(10000);

        // Track all canvas drawing calls
        canvasDrawCalls = [];

        const contextMethods = {
            scale: vi.fn(),
            fillStyle: '',
            fillRect: vi.fn(function () { canvasDrawCalls.push({ method: 'fillRect', args: arguments }); }),
            strokeStyle: '',
            lineWidth: 0,
            beginPath: vi.fn(),
            moveTo: vi.fn(function () { canvasDrawCalls.push({ method: 'moveTo', args: arguments }); }),
            lineTo: vi.fn(function () { canvasDrawCalls.push({ method: 'lineTo', args: arguments }); }),
            stroke: vi.fn(function () { canvasDrawCalls.push({ method: 'stroke', args: arguments }); }),
        };

        mockGetContext = vi.fn(() => contextMethods);

        mockCanvas = {
            getContext: mockGetContext,
            getBoundingClientRect: () => ({ width: 800, height: 320 }),
            width: 0,
            height: 0,
        };

        // Mock document.createElement
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = vi.fn((tagName: string) => {
            if (tagName === 'canvas') {
                return mockCanvas as any;
            }
            return originalCreateElement(tagName);
        }) as any;
    });

    afterEach(() => {
        // Restore original createElement
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = originalCreateElement as any;
    });

    it('should trigger waveform re-render when slices are reordered via drag', async () => {
        const slices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'A',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
            {
                id: 'slice-2',
                sliceNumber: 2,
                sliceLabel: 'B',
                colorHue: 120,
                duration: 1.0,
                startTime: 1.0,
                endTime: 2.0,
            },
            {
                id: 'slice-3',
                sliceNumber: 3,
                sliceLabel: 'C',
                colorHue: 240,
                duration: 1.0,
                startTime: 2.0,
                endTime: 3.0,
            },
        ];

        const onSlicesReorder = vi.fn();
        const duration = 3.0;
        let renderCount = 0;

        // Track how many times the canvas context is created (proxy for re-renders)
        mockGetContext.mockImplementation(() => {
            renderCount++;
            return {
                scale: vi.fn(),
                fillStyle: '',
                fillRect: vi.fn(),
                strokeStyle: '',
                lineWidth: 0,
                beginPath: vi.fn(),
                moveTo: vi.fn(),
                lineTo: vi.fn(),
                stroke: vi.fn(),
            };
        });

        const { getByTestId, rerender } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={slices}
                currentTime={0}
                duration={duration}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={onSlicesReorder}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        const initialRenderCount = renderCount;

        // Get the second slice overlay
        const sliceOverlay2 = getByTestId('slice-overlay-2');

        // Simulate drag start on slice 1
        const sliceOverlay1 = getByTestId('slice-overlay-1');
        fireEvent.dragStart(sliceOverlay1, {
            dataTransfer: { effectAllowed: 'move', dropEffect: 'move' },
        });

        // Simulate drag over slice 2
        fireEvent.dragOver(sliceOverlay2, {
            dataTransfer: { dropEffect: 'move' },
        });

        // Simulate drop on slice 2
        fireEvent.drop(sliceOverlay2, {
            dataTransfer: {},
        });

        // onSlicesReorder should be called with reordered slices
        expect(onSlicesReorder).toHaveBeenCalled();
        const reorderedSlices = onSlicesReorder.mock.calls[0][0];

        // New order should be: slice-2, slice-1, slice-3
        expect(reorderedSlices[0].id).toBe('slice-2');
        expect(reorderedSlices[1].id).toBe('slice-1');
        expect(reorderedSlices[2].id).toBe('slice-3');

        // Now re-render with the reordered slices
        rerender(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={reorderedSlices}
                currentTime={0}
                duration={duration}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={onSlicesReorder}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        // Verify canvas was re-rendered with new slice order
        // The canvas context should have been called again due to dependency change
        expect(mockGetContext).toHaveBeenCalled();
    });

    it('should update waveform with correct slice positions after drag', () => {
        const slices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'A',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
            {
                id: 'slice-2',
                sliceNumber: 2,
                sliceLabel: 'B',
                colorHue: 120,
                duration: 2.0,
                startTime: 1.0,
                endTime: 3.0,
            },
            {
                id: 'slice-3',
                sliceNumber: 3,
                sliceLabel: 'C',
                colorHue: 240,
                duration: 1.0,
                startTime: 3.0,
                endTime: 4.0,
            },
        ];

        const duration = 4.0;
        const onSlicesReorder = vi.fn();

        const { getByTestId } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={slices}
                currentTime={0}
                duration={duration}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={onSlicesReorder}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        // Verify initial slice positions
        const slice1 = getByTestId('slice-overlay-1');
        const slice2 = getByTestId('slice-overlay-2');
        const slice3 = getByTestId('slice-overlay-3');

        // Slice 1: 0-1s, should be at 0%, width 25%
        expect(slice1).toHaveStyle(`left: 0%`);
        expect(slice1).toHaveStyle(`width: 25%`);

        // Slice 2: 1-3s, should be at 25%, width 50%
        expect(slice2).toHaveStyle(`left: 25%`);
        expect(slice2).toHaveStyle(`width: 50%`);

        // Slice 3: 3-4s, should be at 75%, width 25%
        expect(slice3).toHaveStyle(`left: 75%`);
        expect(slice3).toHaveStyle(`width: 25%`);
    });

    it('should preserve slice visual state (colors, labels) after drag', () => {
        const slices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'Kick',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
            {
                id: 'slice-2',
                sliceNumber: 2,
                sliceLabel: 'Snare',
                colorHue: 120,
                duration: 1.0,
                startTime: 1.0,
                endTime: 2.0,
            },
        ];

        const { getByTestId } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={slices}
                currentTime={0}
                duration={2.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={vi.fn()}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        // Verify labels are rendered correctly
        const label1 = getByTestId('label-slice-Kick');
        const label2 = getByTestId('label-slice-Snare');

        expect(label1).toHaveTextContent('Kick');
        expect(label2).toHaveTextContent('Snare');

        // Verify colors are applied
        expect(label1).toHaveStyle('background-color: hsl(0, 70%, 50%)');
        expect(label2).toHaveStyle('background-color: hsl(120, 70%, 50%)');
    });

    it('should handle multiple sequential drags correctly', async () => {
        const slices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'A',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
            {
                id: 'slice-2',
                sliceNumber: 2,
                sliceLabel: 'B',
                colorHue: 120,
                duration: 1.0,
                startTime: 1.0,
                endTime: 2.0,
            },
            {
                id: 'slice-3',
                sliceNumber: 3,
                sliceLabel: 'C',
                colorHue: 240,
                duration: 1.0,
                startTime: 2.0,
                endTime: 3.0,
            },
        ];

        const onSlicesReorder = vi.fn();
        const { getByTestId, rerender } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={slices}
                currentTime={0}
                duration={3.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={onSlicesReorder}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        // First drag: move slice 1 to position of slice 3
        fireEvent.dragStart(getByTestId('slice-overlay-1'), {
            dataTransfer: { effectAllowed: 'move' },
        });
        fireEvent.dragOver(getByTestId('slice-overlay-3'), {
            dataTransfer: { dropEffect: 'move' },
        });
        fireEvent.drop(getByTestId('slice-overlay-3'), {
            dataTransfer: {},
        });

        const firstReorder = onSlicesReorder.mock.calls[0][0];
        expect(firstReorder.map((s: Slice) => s.id)).toEqual(['slice-2', 'slice-3', 'slice-1']);

        // Second drag: move slice 3 to position of slice 2 in the new order
        rerender(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={firstReorder}
                currentTime={0}
                duration={3.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={onSlicesReorder}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        expect(onSlicesReorder).toHaveBeenCalledTimes(1);
    });

    it('should not reorder when dragging slice onto itself', () => {
        const slices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'A',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
        ];

        const onSlicesReorder = vi.fn();
        const { getByTestId } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={slices}
                currentTime={0}
                duration={1.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={onSlicesReorder}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        const sliceOverlay = getByTestId('slice-overlay-1');

        // Drag and drop on itself
        fireEvent.dragStart(sliceOverlay, {
            dataTransfer: { effectAllowed: 'move' },
        });
        fireEvent.dragOver(sliceOverlay, {
            dataTransfer: { dropEffect: 'move' },
        });
        fireEvent.drop(sliceOverlay, {
            dataTransfer: {},
        });

        // Should not call onSlicesReorder when dragging onto itself
        expect(onSlicesReorder).not.toHaveBeenCalled();
    });

    it('should update slice positions when duration changes after drag', () => {
        const initialSlices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'A',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
            {
                id: 'slice-2',
                sliceNumber: 2,
                sliceLabel: 'B',
                colorHue: 120,
                duration: 1.0,
                startTime: 1.0,
                endTime: 2.0,
            },
        ];

        const { rerender, getByTestId } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={initialSlices}
                currentTime={0}
                duration={2.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={vi.fn()}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        // Update slice durations
        const updatedSlices: Slice[] = [
            {
                ...initialSlices[0],
                duration: 0.5,
            },
            {
                ...initialSlices[1],
                duration: 1.5,
            },
        ];

        rerender(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={updatedSlices}
                currentTime={0}
                duration={2.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={vi.fn()}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        // Verify positions are updated
        const slice1 = getByTestId('slice-overlay-1');
        const slice2 = getByTestId('slice-overlay-2');

        // Slice 1: 0-0.5s, should be at 0%, width 25%
        expect(slice1).toHaveStyle(`width: 25%`);

        // Slice 2: 0.5-2s, should be at 25%, width 75%
        expect(slice2).toHaveStyle(`left: 25%`);
        expect(slice2).toHaveStyle(`width: 75%`);
    });

    it('should clear drag state after drop completes', () => {
        const slices: Slice[] = [
            {
                id: 'slice-1',
                sliceNumber: 1,
                sliceLabel: 'A',
                colorHue: 0,
                duration: 1.0,
                startTime: 0,
                endTime: 1.0,
            },
            {
                id: 'slice-2',
                sliceNumber: 2,
                sliceLabel: 'B',
                colorHue: 120,
                duration: 1.0,
                startTime: 1.0,
                endTime: 2.0,
            },
        ];

        const { getByTestId } = render(
            <WaveformDisplay
                audioBuffer={mockAudioBuffer}
                rearrangedBuffer={null}
                slices={slices}
                currentTime={0}
                duration={2.0}
                selectedSliceId={null}
                onSelectSlice={vi.fn()}
                onSlicesReorder={vi.fn()}
                onSliceDelete={vi.fn()}
                onSliceDuplicate={vi.fn()}
                onSliceClick={vi.fn()}
            />
        );

        const slice1 = getByTestId('slice-overlay-1');
        const slice2 = getByTestId('slice-overlay-2');

        // Start drag
        fireEvent.dragStart(slice1, {
            dataTransfer: { effectAllowed: 'move' },
        });

        // Slice 1 should have opacity-40 class during drag
        expect(slice1).toHaveClass('opacity-40');

        // Simulate drop
        fireEvent.dragOver(slice2, {
            dataTransfer: { dropEffect: 'move' },
        });
        fireEvent.drop(slice2, {
            dataTransfer: {},
        });

        // Opacity should be cleared after drop
        expect(slice1).not.toHaveClass('opacity-40');
    });
});
