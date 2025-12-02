// app/components/profile/TabButton.tsx
'use client';

import GenericTabButton from '../common/TabButton';

type InnerTab = 'info' | 'activity';

interface ProfileTabButtonProps {
  tab: InnerTab;
  label: string;
  activeTab: InnerTab;
  onClick: (tab: InnerTab) => void;
}

export default function ProfileTabButton({ tab, label, activeTab, onClick }: ProfileTabButtonProps) {
  const baseClass = "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300";
  const activeClass = 'bg-red-600 text-white';
  const inactiveClass = 'bg-card text-muted-foreground hover:bg-muted';

  return (
    <GenericTabButton<InnerTab>
      id={tab}
      label={label}
      activeId={activeTab}
      onClick={onClick}
      baseClassName={baseClass}
      activeClassName={activeClass}
      inactiveClassName={inactiveClass}
    />
  );
}
