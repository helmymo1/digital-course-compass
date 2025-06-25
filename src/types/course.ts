
export interface Course {
  _id: string;
  id?: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  } | string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  estimatedDurationHours?: number;
  averageRating?: number;
  rating?: number;
  enrollmentCount?: number;
  totalStudents?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
