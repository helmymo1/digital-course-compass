import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface WishlistContextType {
  wishlistItems: string[]; // Array of course IDs
  addToWishlist: (courseId: string) => Promise<void>;
  removeFromWishlist: (courseId: string) => Promise<void>;
  isWishlisted: (courseId: string) => boolean;
  loading: boolean;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
  userId: string | null; // Or however the user ID is accessed
}

// Mock API functions (replace with actual API calls)
const fetchUserWishlistAPI = async (userId: string): Promise<string[]> => {
  console.log(`API CALL (mock): Fetching wishlist for user ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  // Simulate fetching from localStorage or a mock backend
  const storedWishlist = localStorage.getItem(`wishlist_${userId}`);
  if (storedWishlist) {
    return JSON.parse(storedWishlist);
  }
  // Return a default mock if nothing is stored
  // return ['1', 'pop1']; // Example: Course ID '1' and 'pop1' are wishlisted
  return [];
};

const addToWishlistAPI = async (userId: string, courseId: string): Promise<boolean> => {
  console.log(`API CALL (mock): Adding course ${courseId} to wishlist for user ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  // Simulate storing in localStorage or a mock backend
  const storedWishlist = localStorage.getItem(`wishlist_${userId}`);
  let wishlist: string[] = storedWishlist ? JSON.parse(storedWishlist) : [];
  if (!wishlist.includes(courseId)) {
    wishlist.push(courseId);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
  }
  return true; // Simulate success
};

const removeFromWishlistAPI = async (userId: string, courseId: string): Promise<boolean> => {
  console.log(`API CALL (mock): Removing course ${courseId} from wishlist for user ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  // Simulate storing in localStorage or a mock backend
  const storedWishlist = localStorage.getItem(`wishlist_${userId}`);
  let wishlist: string[] = storedWishlist ? JSON.parse(storedWishlist) : [];
  if (wishlist.includes(courseId)) {
    wishlist = wishlist.filter(id => id !== courseId);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
  }
  return true; // Simulate success
};


export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children, userId }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial wishlist
  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchUserWishlistAPI(userId)
        .then(items => {
          setWishlistItems(items);
          setError(null);
        })
        .catch(err => {
          console.error("Failed to fetch wishlist:", err);
          setError("Failed to load wishlist.");
          setWishlistItems([]); // Clear wishlist on error
        })
        .finally(() => setLoading(false));
    } else {
      setWishlistItems([]); // No user, no wishlist
    }
  }, [userId]);

  const addToWishlist = useCallback(async (courseId: string) => {
    if (!userId) {
      setError("User not logged in."); // Or trigger login modal
      return;
    }
    setLoading(true);
    try {
      const success = await addToWishlistAPI(userId, courseId);
      if (success) {
        setWishlistItems(prev => [...prev, courseId]);
        setError(null);
      } else {
        setError("Failed to add to wishlist.");
      }
    } catch (err) {
      setError("Error adding to wishlist.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const removeFromWishlist = useCallback(async (courseId: string) => {
    if (!userId) {
      setError("User not logged in.");
      return;
    }
    setLoading(true);
    try {
      const success = await removeFromWishlistAPI(userId, courseId);
      if (success) {
        setWishlistItems(prev => prev.filter(id => id !== courseId));
        setError(null);
      } else {
        setError("Failed to remove from wishlist.");
      }
    } catch (err) {
      setError("Error removing from wishlist.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const isWishlisted = useCallback((courseId: string): boolean => {
    return wishlistItems.includes(courseId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isWishlisted, loading, error }}>
      {children}
    </WishlistContext.Provider>
  );
};
