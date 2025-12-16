"use client";

import ErrorMessage from "@/app/components/common/ErrorMessage";
import { useAuth } from "@/app/context/AuthContext";
import { changePassword } from "@/lib/api/user"; // Will create this function
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordForm() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      // Example minimum length
      setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setSuccess("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      logout();
      router.push("/login");
    } catch (err: unknown) {
      console.error("Password change error:", err);
      if (err instanceof Error) {
        if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          logout();
          router.push("/login");
        } else {
          setError(err.message || "비밀번호 변경에 실패했습니다.");
        }
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-zinc-600 dark:to-zinc-800 opacity-50" />

      <div className="relative z-10 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4 text-zinc-900 dark:text-white mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 15V17M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10C19.1046 10 20 10.8954 20 12V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V12C4 10.8954 4.89543 10 6 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white mb-2">
          Locker Room <span className="text-blue-600">Access</span>
        </h2>
        <p className="text-zinc-500 font-medium">Secure your account with a strong combination.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-bold text-zinc-900 dark:text-white text-lg tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-zinc-400"
              placeholder="Enter current code"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-bold text-zinc-900 dark:text-white text-lg tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-zinc-400"
              placeholder="Enter new code"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmNewPassword"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-bold text-zinc-900 dark:text-white text-lg tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-zinc-400"
              placeholder="Confirm new code"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <ErrorMessage message={error} />
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 font-bold text-center">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 mt-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-lg tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Security Code"}
        </button>
      </form>
    </div>
  );
}
