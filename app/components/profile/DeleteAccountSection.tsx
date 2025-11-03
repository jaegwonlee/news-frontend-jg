"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/lib/api/user"; // Will create this function
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import ErrorMessage from "@/app/components/common/ErrorMessage";

export default function DeleteAccountSection() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccount(token, password);
      alert("계정이 성공적으로 삭제되었습니다.");
      logout();
      router.push("/login");
    } catch (err: any) {
      console.error("Account deletion error:", err);
      if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        logout();
        router.push("/login");
      } else {
        setError(err.message || "계정 삭제에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow border border-zinc-700">
      <h2 className="text-2xl font-semibold mb-4 text-red-400">계정 삭제</h2>
      <p className="text-zinc-200 mb-4">
        계정을 삭제하려면 비밀번호를 입력하세요. 이 작업은 되돌릴 수 없습니다.
      </p>
      <form onSubmit={handleDelete} className="space-y-4">
        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-zinc-200">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="passwordConfirm"
            className="mt-1 block w-full rounded-md border-zinc-700 bg-zinc-800 text-white shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <ErrorMessage message={error} />}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="small" /> : "계정 삭제"}
        </button>
      </form>
    </div>
  );
}
