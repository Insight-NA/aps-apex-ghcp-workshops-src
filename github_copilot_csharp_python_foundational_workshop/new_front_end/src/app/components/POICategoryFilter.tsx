import { POICategory } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Filter } from 'lucide-react';
import { useState } from 'react';

interface POICategoryFilterProps {
  selectedCategories: POICategory[];
  onCategoriesChange: (categories: POICategory[]) => void;
}

const categoryLabels: Record<POICategory, { label: string; icon: string }> = {
  'restaurant': { label: 'Restaurants', icon: '🍴' },
  'hotel': { label: 'Hotels', icon: '🏨' },
  'attraction': { label: 'Attractions', icon: '🎭' },
  'gas-station': { label: 'Gas Stations', icon: '⛽' },
  'scenic-view': { label: 'Scenic Views', icon: '🏞️' },
  'park': { label: 'Parks', icon: '🌳' },
  'museum': { label: 'Museums', icon: '🏛️' },
  'shopping': { label: 'Shopping', icon: '🛍️' },
};

export function POICategoryFilter({ selectedCategories, onCategoriesChange }: POICategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: POICategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        className="shadow-lg"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filter POIs
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-64 p-4 shadow-xl">
          <h3 className="font-semibold mb-3">Show on Map</h3>
          <div className="space-y-2">
            {(Object.keys(categoryLabels) as POICategory[]).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label
                  htmlFor={category}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <span>{categoryLabels[category].icon}</span>
                  <span>{categoryLabels[category].label}</span>
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
