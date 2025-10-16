import Link from 'next/link';

interface DebateRoom {
  id: string;
  title: string;
  participants: number;
  comments: number;
}

interface DebateRoomListProps {
  rooms: DebateRoom[];
}

export default function DebateRoomList({ rooms }: DebateRoomListProps) {
  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Link key={room.id} href={`/debate/${room.id}`} className="block p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors">
          <p className="font-semibold truncate">{room.title}</p>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>참여자: {room.participants}명</span>
            <span>댓글: {room.comments}개</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
