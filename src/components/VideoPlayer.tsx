
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoPlayerProps {
  title: string;
  videoUrl?: string;
  thumbnail?: string;
}

const VideoPlayer = ({ title, videoUrl, thumbnail }: VideoPlayerProps) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([80]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-black"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>
        </div>

        {/* Sample Video Overlay */}
        <div className="absolute top-4 right-4">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            SAMPLE
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">0:00</span>
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-white text-sm">5:24</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:bg-gray-800 p-2"> {/* Removed size="sm", added padding */}
              <SkipBack className="h-5 w-5" /> {/* Increased icon size */}
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800 p-2" // Removed size="sm", added padding
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />} {/* Increased icon size */}
            </Button>
            <Button variant="ghost" className="text-white hover:bg-gray-800 p-2"> {/* Removed size="sm", added padding */}
              <SkipForward className="h-5 w-5" /> {/* Increased icon size */}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800 p-2" // Removed size="sm", added padding
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />} {/* Increased icon size */}
            </Button>
            <div className="w-24"> {/* Slightly increased width for volume slider area */}
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
              />
            </div>
            <Button variant="ghost" className="text-white hover:bg-gray-800 p-2"> {/* Removed size="sm", added padding */}
              <Maximize className="h-5 w-5" /> {/* Increased icon size */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
