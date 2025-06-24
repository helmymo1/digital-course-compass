
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Star, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  totalStudents: number;
  duration: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  onViewDetails?: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  price,
  originalPrice,
  image,
  rating,
  totalStudents,
  duration,
  category,
  level,
  onViewDetails
}) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      navigate(`/course/${id}`);
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 9}>
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
          />
        </AspectRatio>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <Badge className={`text-xs ${getLevelColor(level)}`}>
              {level}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">by {instructor}</p>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{totalStudents.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pt-2">
        <Button 
          className="w-full" 
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
