// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Components
import DashboardSidebar from "@/components/DashboardSidebar";
import Chat from "@/components/Chat";

export default async function page() {
  const user = await currentUser();
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "Guest";

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <DashboardSidebar user={user} displayName={displayName} />

      {/* Main */}
      <main className="w-4/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Hello {user?.firstName ?? user?.fullName ?? displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            How can I help you today?
          </p>
        </div>

        {/* Chat Component */}
        <div className="flex-1 min-h-0">
          <Chat />
        </div>
      </main>
    </div>
  );
}
