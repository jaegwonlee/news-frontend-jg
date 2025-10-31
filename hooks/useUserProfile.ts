
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, UserUpdate } from '@/types';
import { getUserProfile, getAvatars, updateUserProfile } from '@/lib/api';
import { BACKEND_BASE_URL } from "@/lib/constants";

export const useUserProfile = () => {
  const { token, logout, login, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileData, setCurrentProfileData] = useState<User | null>(null);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfileAndAvatars = async () => {
      setError(null);
      try {
        setIsLoading(true);
        const userProfile = await getUserProfile(token);
        setProfile(userProfile);
        setCurrentProfileData(userProfile);
        setSelectedAvatar(userProfile.profile_image_url || undefined);

        const avatarList = await getAvatars();
        setAvatars(avatarList);
      } catch (err: any) {
        setError(err.message || "프로필 정보를 불러오는데 실패했습니다.");
        if (String(err.message).includes("401")) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndAvatars();
  }, [token, isAuthLoading, router, logout]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  }, [profile]);

  const handleUpdateProfile = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !profile) return;
    setError(null);

    const relativeAvatarUrl = selectedAvatar ? selectedAvatar.replace(BACKEND_BASE_URL, "") : undefined;

    const updatedData: UserUpdate = {
      nickname: profile.nickname,
      introduction: profile.introduction,
      profile_image_url: relativeAvatarUrl,
      phone: profile.phone,
    };

    try {
      setIsUpdating(true);
      const updatedUser = await updateUserProfile(token, updatedData);
      setProfile(updatedUser);
      setCurrentProfileData(updatedUser);
      setSelectedAvatar(updatedUser.profile_image_url || undefined);
      login(token, updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }, [token, profile, selectedAvatar, login]);

  const handleCancelEdit = useCallback(() => {
    setProfile(currentProfileData);
    setSelectedAvatar(currentProfileData?.profile_image_url || undefined);
    setIsEditing(false);
    setError(null);
  }, [currentProfileData]);

  const handleSetIsEditing = useCallback((editing: boolean) => {
    setIsEditing(editing);
    if (!editing) {
      handleCancelEdit(); // Reset changes if cancelling edit mode
    }
  }, [handleCancelEdit]);

  return {
    profile,
    isEditing,
    isLoading: isLoading || isAuthLoading,
    error,
    avatars,
    selectedAvatar,
    isUpdating,
    handleInputChange,
    handleUpdateProfile,
    handleCancelEdit,
    setIsEditing: handleSetIsEditing,
    setSelectedAvatar,
  };
};
