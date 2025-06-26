import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Assuming you have a toast component

interface OfflineDownloadButtonProps {
  courseId: string;
  courseTitle: string;
}

const OfflineDownloadButton: React.FC<OfflineDownloadButtonProps> = ({ courseId, courseTitle }) => {
  const { toast } = useToast();

  const handleDownloadClick = () => {
    // For now, this is a placeholder.
    // Actual offline download would involve:
    // 1. Calling a backend API (e.g., POST /api/mobile/download-content) to prepare/get content links.
    // 2. Using service workers and IndexedDB/localStorage to store content.
    console.log(`Attempting to download content for course: ${courseTitle} (ID: ${courseId})`);
    toast({
      title: "Offline Download",
      description: `Offline download for "${courseTitle}" is coming soon!`,
      variant: "default", // Or "info" if you have such a variant
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownloadClick}
      className="w-full md:w-auto" // Full width on mobile, auto on larger screens
    >
      <Download className="mr-2 h-4 w-4" />
      Download for Offline
    </Button>
  );
};

export default OfflineDownloadButton;
