// app/components/profile/TabButton.tsx
'use client';

type InnerTab = 'info' | 'activity';

interface TabButtonProps {
  tab: InnerTab;
  label: string;
  activeTab: InnerTab;
  onClick: (tab: InnerTab) => void;
}

export default function TabButton({ tab, label, activeTab, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
        activeTab === tab ? 'bg-red-600 text-white' : 'bg-card text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}
