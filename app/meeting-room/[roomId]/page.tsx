import MeetingRoom from "@/components/meeting/MeetingRoom";

export default function MeetingRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  return (
    <main className=" h-full min-h-fit">
      <h2>{params?.roomId}</h2>
      <MeetingRoom roomId={params?.roomId} />
    </main>
  );
}
