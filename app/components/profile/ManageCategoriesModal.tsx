"use client";

import { SavedArticleCategory } from "@/lib/types/shared";
import { Check, Edit, Loader, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ManageCategoriesModalProps {
  categories: SavedArticleCategory[];
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (categoryId: number, newName: string) => Promise<void>;
  onDelete: (categoryId: number) => Promise<void>;
}

export default function ManageCategoriesModal({
  categories,
  onClose,
  onCreate,
  onRename,
  onDelete,
}: ManageCategoriesModalProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [createCategoryName, setCreateCategoryName] = useState("");
  const [loadingState, setLoadingState] = useState<{ type: "create" | "rename" | "delete"; id: number | "new" } | null>(
    null
  );

  const handleStartEdit = (category: SavedArticleCategory) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setNewCategoryName("");
  };

  const handleSaveRename = async (categoryId: number) => {
    if (!newCategoryName.trim()) return;
    setLoadingState({ type: "rename", id: categoryId });
    await onRename(categoryId, newCategoryName);
    setLoadingState(null);
    handleCancelEdit();
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setLoadingState({ type: "delete", id: categoryId });
    await onDelete(categoryId);
    setLoadingState(null);
  };

  const handleCreateCategory = async () => {
    if (!createCategoryName.trim()) return;
    setLoadingState({ type: "create", id: "new" });
    await onCreate(createCategoryName);
    setLoadingState(null);
    setCreateCategoryName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
              Category <span className="text-blue-600">Manager</span>
            </h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mt-0.5">
              Organize your fight knowledge
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </header>

        {/* Create New Section */}
        <div className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <label className="block text-xs font-black uppercase text-zinc-400 mb-2 ml-1">Create New Category</label>
          <div className="flex gap-2">
            <div className="relative grow">
              <input
                type="text"
                value={createCategoryName}
                onChange={(e) => setCreateCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                placeholder="Ex. Heavyweight News"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded-xl px-4 py-3 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleCreateCategory}
              disabled={!createCategoryName.trim() || loadingState?.type === "create"}
              className="shrink-0 w-12 h-12 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
            >
              {loadingState?.type === "create" ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Plus size={24} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-zinc-50 dark:bg-black/20">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-sm font-medium">No custom categories yet.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                {editingCategoryId === cat.id ? (
                  <div className="grow flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveRename(cat.id)}
                      className="grow bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 px-3 py-2 rounded-lg font-bold outline-none border border-blue-200 dark:border-blue-800"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(cat.id)}
                      className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
                      disabled={loadingState?.id === cat.id}
                    >
                      {loadingState?.type === "rename" && loadingState.id === cat.id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} strokeWidth={3} />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-zinc-400">#{cat.id}</span>
                    </div>
                    <span className="grow font-bold text-zinc-700 dark:text-zinc-200 truncate">{cat.name}</span>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        disabled={!!loadingState}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        disabled={loadingState?.id === cat.id}
                      >
                        {loadingState?.type === "delete" && loadingState.id === cat.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium text-center">
            * Deleting a category will move its articles to{" "}
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Unclassified</span>.
          </p>
        </footer>
      </div>
    </div>
  );
}
