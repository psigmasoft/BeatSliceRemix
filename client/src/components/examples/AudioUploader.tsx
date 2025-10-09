import AudioUploader from '../AudioUploader';

export default function AudioUploaderExample() {
  return (
    <AudioUploader 
      onFileSelect={(file) => console.log('File selected:', file.name)} 
    />
  );
}
