import DebateRoomContent from "@/components/DebateRoomContent";

export default async function DebateRoomPage({ params }: { params: { roomId: string } }) {
  const awaitedParams = await params;
  return (
    <div className="h-[calc(100vh-80px)]">
      <DebateRoomContent roomId={awaitedParams.roomId} />
    </div>
  );
}
