import DebateRoomContent from "@/components/DebateRoomContent";

export default function DebateRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-10rem)]">
      <DebateRoomContent roomId={params.roomId} />
    </div>
  );
}
