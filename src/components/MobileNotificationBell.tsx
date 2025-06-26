import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/components/ui/use-toast';

// Placeholder for NotificationList component
// It would typically be imported: import NotificationList from './NotificationList';
const NotificationListPlaceholder = () => {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">No new notifications.</p>
      {/* Sample structure for a notification item */}
      {/*
      <div className="mt-2 p-2 border-t">
        <h4 className="font-semibold">New Course Available!</h4>
        <p className="text-xs text-muted-foreground">Check out "Advanced TypeScript"</p>
      </div>
      */}
    </div>
  );
};


const MobileNotificationBell: React.FC = () => {
  const [hasUnread, setHasUnread] = useState(true); // Simulate unread notifications
  const { toast } = useToast();

  const handleBellClick = () => {
    // In a real app, clicking might open a dropdown/modal with notifications
    // and potentially mark them as read.
    // For now, it uses a Popover.
    if (hasUnread) {
      // setHasUnread(false); // Example: mark as read when opened
    }
    // toast({
    //   title: "Notifications",
    //   description: "Notification panel would open here.",
    // });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={handleBellClick}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80"> {/* Adjust width as needed */}
        <div className="p-2 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
        </div>
        <NotificationListPlaceholder />
        {/* Replace with <NotificationList /> when created */}
      </PopoverContent>
    </Popover>
  );
};

export default MobileNotificationBell;
