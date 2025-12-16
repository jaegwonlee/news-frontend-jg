"use client";

import ConfirmationModal from "@/app/components/common/ConfirmationModal";
import ErrorMessage from "@/app/components/common/ErrorMessage";
import { useAuth } from "@/app/context/AuthContext";
import { deleteAccount } from "@/lib/api/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAccountSection() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setError(null);
    setPassword("");
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token) {
      setError("세션이 만료되었습니다. 다시 로그인해주세요.");
      return;
    }

    if (!password) {
      setError("계속하려면 현재 비밀번호를 입력해야 합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteAccount(token, password);
      alert("계정이 성공적으로 비활성화되었습니다. 이용해주셔서 감사합니다.");
      logout();
      router.push("/");
    } catch (err: unknown) {
      console.error("Account deletion error:", err);
      const errorMessage = err instanceof Error ? String(err.message) : "알 수 없는 오류";

      if (errorMessage.includes("비밀번호 불일치")) {
        setError("비밀번호가 올바르지 않습니다. 다시 확인해주세요.");
      } else if (errorMessage.includes("비밀번호 미입력")) {
        setError("비밀번호를 입력해야 합니다.");
      } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        logout();
        router.push("/login");
      } else {
        setError(errorMessage || "계정 삭제 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-red-600">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM13 13.5V17H11V13.5H13ZM13 11.5H11V7H13V11.5Z" />
          </svg>
        </div>

        <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-red-600 dark:text-red-500 mb-2">
              Retire Fighter
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed max-w-xl">
              Permanently delete your profile and all associated fight records. <br className="hidden md:block" />
              This action is <span className="font-bold underline decoration-red-400">irreversible</span>.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-sm tracking-wider px-8 py-4 rounded-xl shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
          >
            Confirm Deletion
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="계정을 비활성화하시겠습니까?"
        confirmText="계정 영구 삭제"
        isLoading={isLoading}
      >
        <p className="mb-4 text-sm text-foreground">
          이 작업은 되돌릴 수 없습니다. 계속하려면 현재 계정의 비밀번호를 입력하고 확인 버튼을 클릭하세요.
        </p>
        <div className="space-y-2">
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-muted-foreground">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="passwordConfirm"
            className="mt-1 block w-full rounded-md border-border bg-input text-foreground shadow-sm focus:border-primary focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <ErrorMessage message={error} />}
        </div>
      </ConfirmationModal>
    </>
  );
}
