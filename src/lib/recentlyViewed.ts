// src/lib/recentlyViewed.ts

const RECENTLY_VIEWED_KEY = 'recentlyViewedCourses';
const MAX_RECENTLY_VIEWED = 10; // Store up to 10 recently viewed courses

export interface RecentlyViewedCourseInfo {
  id: string;
  viewedAt: number; // Timestamp
}

/**
 * Adds a course to the recently viewed list in localStorage.
 * Keeps the list sorted by most recent and limits its size.
 * @param courseId The ID of the course to add.
 */
export const addRecentlyViewedCourse = (courseId: string): void => {
  if (typeof window === 'undefined') return; // Guard for SSR or non-browser environments

  try {
    const existingItems = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let viewedCourses: RecentlyViewedCourseInfo[] = existingItems ? JSON.parse(existingItems) : [];

    // Remove the course if it already exists to move it to the top (most recent)
    viewedCourses = viewedCourses.filter(item => item.id !== courseId);

    // Add the new course to the beginning of the array
    viewedCourses.unshift({ id: courseId, viewedAt: Date.now() });

    // Ensure the list doesn't exceed the maximum size
    if (viewedCourses.length > MAX_RECENTLY_VIEWED) {
      viewedCourses = viewedCourses.slice(0, MAX_RECENTLY_VIEWED);
    }

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewedCourses));
  } catch (error) {
    console.error('Error managing recently viewed courses in localStorage:', error);
  }
};

/**
 * Retrieves the list of recently viewed course IDs.
 * @returns An array of course IDs, sorted by most recently viewed.
 */
export const getRecentlyViewedCourseIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const items = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!items) {
      return [];
    }
    const viewedCourses: RecentlyViewedCourseInfo[] = JSON.parse(items);
    // Sort by viewedAt descending (most recent first) just in case, though unshift should maintain it
    return viewedCourses.sort((a, b) => b.viewedAt - a.viewedAt).map(item => item.id);
  } catch (error) {
    console.error('Error retrieving recently viewed courses from localStorage:', error);
    return [];
  }
};

/**
 * Clears all recently viewed courses from localStorage.
 */
export const clearRecentlyViewedCourses = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed courses from localStorage:', error);
  }
};
