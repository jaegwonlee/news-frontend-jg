"use client";

import ProfileEditForm from "./ProfileEditForm";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountSection from "./DeleteAccountSection";
import { User } from "@/types";

interface ProfileSettingsProps {
  profile: User;
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  avatars: string[];
  selectedAvatar: string | undefined;
  setSelectedAvatar: (avatar: string | undefined) => void;
}

export default function ProfileSettings({
  profile,
  isEditing,
  onInputChange,
  avatars,
  selectedAvatar,
  setSelectedAvatar,
}: ProfileSettingsProps) {
  return (
    <div className="space-y-8">
      <ProfileEditForm
        profile={profile}
        isEditing={isEditing}
        onInputChange={onInputChange}
        avatars={avatars}
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
      />
      <ChangePasswordForm />
      <DeleteAccountSection />
    </div>
  );
}
