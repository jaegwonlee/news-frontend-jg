import ExclusivesClientPage from "@/components/main/ExclusivesClientPage";
import ChatRoom from "@/components/common/ChatRoom";

export default function ExclusivesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4 pt-6">
      <ExclusivesClientPage />
      <div className="lg:col-span-1 lg:sticky lg:top-24 h-[calc(100vh-150px)]">
        <ChatRoom title="자유 토론" />
      </div>
    </div>
  );
}
