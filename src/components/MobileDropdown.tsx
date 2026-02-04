import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MobileDropdownProps {
  title: string;
  gender: 'male' | 'female';
  categories: any[];
  products: any[];
  onClose: () => void;
}

export const MobileDropdown: React.FC<MobileDropdownProps> = ({ title, gender, categories, products, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get categories that have products for this gender
  const genderCategories = categories.filter(category => {
    const hasGenderProducts = products.some(product => 
      product.category === category.name && 
      product.gender === gender
    );
    return hasGenderProducts;
  });

  if (genderCategories.length === 0) return null;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-base font-semibold px-3 py-3 rounded-md text-white/90 hover:bg-white/10 transition-colors flex items-center justify-between"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="ml-4 flex flex-col gap-1 py-2">
          {genderCategories.map((category) => (
            <Link
              key={category.slug || category.name}
              to={`/collection/${category.slug || category.name}`}
              className="text-sm text-white/80 hover:text-white px-3 py-2 rounded hover:bg-white/5 transition-colors"
              onClick={onClose}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
