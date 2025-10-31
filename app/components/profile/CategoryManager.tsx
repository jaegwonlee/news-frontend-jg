import { useState } from 'react';
import { Plus } from 'lucide-react';

interface CategoryManagerProps {
  onCreateCategory: (name: string) => void;
}

export default function CategoryManager({ onCreateCategory }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="새 카테고리 만들기"
        className="bg-zinc-700 text-white px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md">
        <Plus size={20} />
      </button>
    </div>
  );
}
