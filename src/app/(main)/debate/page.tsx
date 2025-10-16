import DebateRoomList from "@/components/main/DebateRoomList";
import { allDebateRooms } from "@/lib/mock-data";

export default function DebateListPage() {
  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b-4 border-red-500 pb-4">전체 논쟁방</h1>
        <DebateRoomList rooms={allDebateRooms} />
      </div>
    </div>
  );
}
