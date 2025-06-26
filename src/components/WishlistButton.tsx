import React from 'react';
import { useWishlist } from '@/contexts/WishlistContext'; // Adjust path as needed
import { Button } from '@/components/ui/button'; // Adjust path as needed
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // For conditional classes

interface WishlistButtonProps {
  courseId: string;
  className?: string; // Allow custom styling
  size?: "default" | "sm" | "lg" | "icon"; // Button size prop
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ courseId, className, size = "icon" }) => {
  const { addToWishlist, removeFromWishlist, isWishlisted, loading: wishlistLoading } = useWishlist();

  const isCurrentlyWishlisted = isWishlisted(courseId);

  const handleToggleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation if the button is on a card that links somewhere
    event.stopPropagation(); // Prevent event bubbling

    if (wishlistLoading) return; // Prevent multiple clicks while processing

    if (isCurrentlyWishlisted) {
      await removeFromWishlist(courseId);
    } else {
      await addToWishlist(courseId);
    }
  };

  return (
    <Button
      variant="ghost" // Or "outline" or whatever fits the design
      size={size}
      onClick={handleToggleWishlist}
      disabled={wishlistLoading}
      className={cn(
        "p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-800/30", // Base styling
        isCurrentlyWishlisted ? "text-rose-500 dark:text-rose-400" : "text-muted-foreground",
        className
      )}
      aria-label={isCurrentlyWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn("h-5 w-5", isCurrentlyWishlisted && "fill-current")}
      />
    </Button>
  );
};

export default WishlistButton;
