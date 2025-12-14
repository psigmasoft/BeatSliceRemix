import '@testing-library/jest-dom';

// Add AudioContext to global scope for tests
if (typeof globalThis !== 'undefined' && !globalThis.AudioContext) {
    globalThis.AudioContext = class MockAudioContext {
        sampleRate = 44100;
        createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
            const buffer = new Float32Array(length);
            return {
                duration: length / sampleRate,
                length,
                numberOfChannels: channels,
                sampleRate,
                getChannelData: () => buffer,
                copyFromChannel: () => {},
                copyToChannel: () => {},
            } as any;
        }
    } as any;
}

// Add PointerEvent to global scope for tests
if (typeof globalThis !== 'undefined' && !globalThis.PointerEvent) {
    globalThis.PointerEvent = class PointerEvent extends Event {
        constructor(type: string, init?: PointerEventInit) {
            super(type, init);
        }
    } as any;
}
