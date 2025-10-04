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

  // Serialize user data for client component
  const serializedUser = user
    ? {
        firstName: user.firstName,
        fullName: user.fullName,
      }
    : null;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <DashboardSidebar user={serializedUser} displayName={displayName} />

      {/* Main */}
      <main className="w-4/5 flex flex-col">
        {/* Chat Component */}
        <div className="flex-1 min-h-0">
          <Chat user={serializedUser} displayName={displayName} />
        </div>
      </main>
    </div>
  );
}
