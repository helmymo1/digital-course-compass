
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Star } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  level: string;
  duration: [number, number];
  rating: number;
  price: string;
  language: string;
  instructor: string;
  features: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onReset }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    level: '',
    duration: [0, 50],
    rating: 0,
    price: '',
    language: '',
    instructor: '',
    features: []
  });

  const categories = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'DevOps',
    'Design',
    'Marketing',
    'Business',
    'Photography'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const priceRanges = ['Free', '$0-$50', '$50-$100', '$100-$200', '$200+'];
  
  const courseFeatures = [
    'Certificates',
    'Downloadable Resources',
    'Lifetime Access',
    'Mobile Access',
    'Assignments',
    'Quizzes',
    'Closed Captions',
    'Live Sessions'
  ];

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: '',
      level: '',
      duration: [0, 50],
      rating: 0,
      price: '',
      language: '',
      instructor: '',
      features: []
    });
    onReset();
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'query' || key === 'duration') return count;
    if (Array.isArray(value)) return count + value.length;
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div>
          <Label htmlFor="search-query">Search</Label>
          <Input
            id="search-query"
            placeholder="Search for courses..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level */}
          <div>
            <Label>Level</Label>
            <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label>Price Range</Label>
            <Select value={filters.price} onValueChange={(value) => setFilters(prev => ({ ...prev, price: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div>
            <Label>Language</Label>
            <Select value={filters.language} onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(language => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <Label>Duration (hours)</Label>
          <div className="mt-2 px-2">
            <Slider
              value={filters.duration}
              onValueChange={(value) => setFilters(prev => ({ ...prev, duration: value as [number, number] }))}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{filters.duration[0]} hours</span>
              <span>{filters.duration[1]} hours</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label>Minimum Rating</Label>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, rating: star }))}
                className={`p-1 rounded ${filters.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
            </span>
          </div>
        </div>

        {/* Features */}
        <div>
          <Label>Course Features</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {courseFeatures.map(feature => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={filters.features.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label htmlFor={feature} className="text-sm">{feature}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search Courses
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
