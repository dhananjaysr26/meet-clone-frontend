import { useRouter } from "next/navigation";
import React, { useState } from "react";

const HomeBanner: React.FC = () => {
  const [meetingId, setMeetingId] = useState("");
  const router = useRouter();

  const handleJoinMeeting = () => {
    // Handle joining a meeting with the meetingId
    console.log(`Joining meeting with ID: ${meetingId}`);
    router.push(`/meeting-room/${meetingId}`);
  };

  const handleCreateMeeting = () => {
    // Handle creating a new meeting
    console.log("Creating a new meeting");
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 animate-fade-in-down">
          Connect with anyone, anywhere
        </h2>
        <p className="text-gray-600 mb-8 animate-fade-in-up">
          Experience seamless video conferencing with Google Meet.
        </p>
        <div className="flex justify-center mb-8 animate-fade-in">
          <input
            type="text"
            placeholder="Enter meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          <button
            onClick={handleJoinMeeting}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-md transition-all duration-300"
          >
            Join Meeting
          </button>
        </div>
        <button
          onClick={handleCreateMeeting}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md transition-all duration-300 animate-bounce"
        >
          Create Meeting
        </button>
      </div>
    </div>
  );
};

export default HomeBanner;
