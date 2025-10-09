import WaveformDisplay from '../WaveformDisplay';

export default function WaveformDisplayExample() {
  const mockAudioBuffer = {
    length: 44100,
    duration: 1.0,
    sampleRate: 44100,
    numberOfChannels: 1,
    getChannelData: () => {
      const data = new Float32Array(44100);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin(i / 100) * 0.5;
      }
      return data;
    },
    copyFromChannel: () => {},
    copyToChannel: () => {},
  } as unknown as AudioBuffer;

  return (
    <WaveformDisplay
      audioBuffer={mockAudioBuffer}
      slicePoints={[0.2, 0.4, 0.6, 0.8]}
      currentTime={0.3}
      duration={1.0}
    />
  );
}
