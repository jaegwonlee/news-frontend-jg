import FormField from "@/app/components/auth/FormField";
import { useSavedArticlesManager } from "@/hooks/useSavedArticles";
import { User } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Edit3, Phone, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../common/Button";

interface ProfileEditFormProps {
  profile: User;
  avatars: string[];
  selectedAvatar: string | undefined;
  isUpdating: boolean;
  error: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onSetSelectedAvatar: (avatarUrl: string) => void;
}

type InnerTab = "info" | "activity";

export default function ProfileEditForm({
  profile,
  avatars,
  selectedAvatar,
  isUpdating,
  error,
  onInputChange,
  onUpdateProfile,
  onCancelEdit,
  onSetSelectedAvatar,
}: ProfileEditFormProps) {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [innerTab, setInnerTab] = useState<InnerTab>("info");
  const { articles: savedArticles } = useSavedArticlesManager();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header with Background Pattern */}
      <div className="relative p-8 md:p-12 text-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6 group">
            {/* Avatar Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-red-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative w-40 h-40 rounded-full p-1 bg-white dark:bg-zinc-900">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800">
                <Image
                  src={selectedAvatar || profile.profile_image_url || "/user-placeholder.svg"}
                  alt="Current Avatar"
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarOptions(!showAvatarOptions)}
              className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Change Avatar"
            >
              <Edit3 size={18} />
            </button>
          </div>

          <h2 className="text-3xl font-black italic uppercase tracking-tight mb-1 text-zinc-900 dark:text-white">
            Edit Profile
          </h2>
          <p className="text-zinc-500 font-medium">Update your fighter card details</p>
        </div>
      </div>

      {/* Avatar Selection Area */}
      <AnimatePresence>
        {showAvatarOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 text-center">
                Select Avatar
              </h3>
              <div className="flex flex-wrap justify-center gap-6">
                {avatars.map((avatarUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onSetSelectedAvatar(avatarUrl);
                      setShowAvatarOptions(false);
                    }}
                    className={cn(
                      "relative w-20 h-20 rounded-full transition-all duration-300",
                      selectedAvatar === avatarUrl
                        ? "ring-4 ring-blue-500 ring-offset-4 ring-offset-white dark:ring-offset-zinc-900 scale-110"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <Image
                      src={avatarUrl}
                      alt={`Avatar ${index}`}
                      fill
                      className="object-cover rounded-full border-2 border-zinc-200 dark:border-zinc-700"
                      unoptimized={true}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8 md:p-12">
        {/* Modern Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl inline-flex gap-2">
            <button
              onClick={() => setInnerTab("info")}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                innerTab === "info"
                  ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              Basic Info
            </button>
            <button
              onClick={() => setInnerTab("activity")}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                innerTab === "activity"
                  ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              My Stats
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-2xl mx-auto min-h-[300px]">
          {innerTab === "info" && (
            <form
              id="profile-form"
              onSubmit={onUpdateProfile}
              className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="space-y-6">
                <FormField
                  id="nickname"
                  label="Nickname"
                  type="text"
                  name="nickname"
                  value={profile.nickname || ""}
                  onChange={onInputChange as React.ChangeEventHandler<HTMLInputElement>}
                  icon={<UserIcon className="w-5 h-5" />}
                  className="bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-700 focus:border-black dark:focus:border-white rounded-xl h-14"
                />
                <FormField
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={onInputChange as React.ChangeEventHandler<HTMLInputElement>}
                  icon={<Phone className="w-5 h-5" />}
                  className="bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-700 focus:border-black dark:focus:border-white rounded-xl h-14"
                />
                <div className="space-y-3">
                  <label
                    htmlFor="introduction"
                    className="text-sm font-bold uppercase tracking-wider text-zinc-500 ml-1"
                  >
                    Bio / Introduction
                  </label>
                  <textarea
                    id="introduction"
                    name="introduction"
                    value={profile.introduction || ""}
                    onChange={onInputChange}
                    rows={5}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl px-5 py-4 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium leading-relaxed"
                    placeholder="Write a short bio about yourself..."
                  />
                </div>
              </div>
            </form>
          )}

          {innerTab === "activity" && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-zinc-900 dark:text-white">Saved Articles</span>
                    <span className="text-sm text-zinc-500">Articles you've bookmarked</span>
                  </div>
                </div>
                <span className="font-black text-4xl text-blue-600 dark:text-blue-400">{savedArticles.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancelEdit}
          className="h-12 px-8 font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          form="profile-form"
          type="submit"
          disabled={isUpdating}
          className="h-12 px-8 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl rounded-xl"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && <div className="bg-red-500 text-white text-sm font-bold text-center p-3 animate-pulse">{error}</div>}
    </div>
  );
}
