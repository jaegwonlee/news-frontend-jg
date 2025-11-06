'use client';

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/api/user";
import ErrorMessage from "@/app/components/common/ErrorMessage";
import ConfirmationModal from "@/app/components/common/ConfirmationModal";

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
    } catch (err: any) {
      console.error("Account deletion error:", err);
      const errorMessage = String(err.message);

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
      <div className="mt-8 p-6 bg-zinc-900 rounded-lg shadow border border-zinc-700">
        <h2 className="text-2xl font-semibold mb-4 text-red-500">계정 비활성화</h2>
        <p className="text-zinc-400 mb-4">
          계정을 비활성화하면 프로필, 저장된 기사, 좋아요 등 모든 활동 기록이 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
        </p>
        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto px-6 py-2 border border-red-600 text-red-500 rounded-md shadow-sm text-sm font-medium hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          계정 비활성화 진행
        </button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="계정을 비활성화하시겠습니까?"
        confirmText="계정 영구 삭제"
        isLoading={isLoading}
      >
        <p className="mb-4 text-sm">
          이 작업은 되돌릴 수 없습니다. 계속하려면 현재 계정의 비밀번호를 입력하고 확인 버튼을 클릭하세요.
        </p>
        <div className="space-y-2">
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-zinc-300">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="passwordConfirm"
            className="mt-1 block w-full rounded-md border-zinc-600 bg-zinc-800 text-white shadow-sm focus:border-red-500 focus:ring-red-500"
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