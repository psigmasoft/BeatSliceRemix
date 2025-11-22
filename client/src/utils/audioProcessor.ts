import { Slice } from "@/components/WaveformDisplay";

export class AudioProcessor {
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Creates a rearranged audio buffer based on slice order
   */
  createRearrangedBuffer(
    originalBuffer: AudioBuffer,
    slices: Slice[]
  ): AudioBuffer {
    const sampleRate = originalBuffer.sampleRate;
    const numberOfChannels = originalBuffer.numberOfChannels;
    
    // Calculate total duration from slices
    const totalDuration = slices.reduce((acc, slice) => acc + slice.duration, 0);
    const totalSamples = Math.floor(totalDuration * sampleRate);
    
    // Create new buffer for rearranged audio
    const rearrangedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      totalSamples,
      sampleRate
    );

    // Copy each slice in the new order
    let currentSample = 0;
    
    for (const slice of slices) {
      const startSample = Math.floor(slice.startTime * sampleRate);
      const endSample = Math.floor(slice.endTime * sampleRate);
      const sliceSamples = endSample - startSample;

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel);
        const rearrangedData = rearrangedBuffer.getChannelData(channel);
        
        // Copy slice data to new position
        for (let i = 0; i < sliceSamples && currentSample + i < totalSamples; i++) {
          const sourceIndex = startSample + i;
          if (sourceIndex < originalData.length) {
            rearrangedData[currentSample + i] = originalData[sourceIndex];
          }
        }
      }
      
      currentSample += sliceSamples;
    }

    return rearrangedBuffer;
  }

  /**
   * Exports audio buffer as WAV file
   */
  exportAsWav(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const data = this.interleaveChannels(buffer);
    const dataLength = data.length * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    this.floatTo16BitPCM(view, 44, data);

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private interleaveChannels(buffer: AudioBuffer): Float32Array {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels;
    const result = new Float32Array(length);

    const channels: Float32Array[] = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let index = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        result[index++] = channels[channel][i];
      }
    }

    return result;
  }

  private floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
