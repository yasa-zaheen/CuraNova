// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Components
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function page() {
  const user = await currentUser();
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "Guest";

  const initials = (() => {
    if (user?.firstName) return user.firstName[0];
    if (user?.fullName)
      return user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("");
    if (displayName) return displayName[0];
    return "G";
  })();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <DashboardSidebar user={user} displayName={displayName} />

      {/* Main */}
      <main className="w-4/5 p-4 flex flex-col">
        {/* Greeting */}
        <section className="flex-1 flex flex-col items-start justify-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-shimmer bg-[length:200%_auto]">
            Hello {user?.firstName ?? user?.fullName ?? displayName}
          </h1>
          <p className="mt-3 text-2xl text-gray-400">
            How can i help you today?
          </p>

          <div className="mt-10 flex gap-6">
            <div className="w-64 rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                🤒
              </div>
              <div className="mt-3 font-semibold">Are you feeling unwell?</div>
              <div className="mt-2 text-sm text-gray-500">
                Check symptoms and get advice based on your condition
              </div>
            </div>

            <div className="w-64 rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                💊
              </div>
              <div className="mt-3 font-semibold">Medication queries</div>
              <div className="mt-2 text-sm text-gray-500">
                Ask questions regarding prescriptions and over-the-counter drugs
              </div>
            </div>

            <div className="w-64 rounded-xl border border-gray-200 bg-gradient-to-br from-pink-50 to-purple-50 p-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                🧠
              </div>
              <div className="mt-3 font-semibold">Mental health check</div>
              <div className="mt-2 text-sm text-gray-500">
                Discuss mental wellbeing and get guidance
              </div>
            </div>
          </div>
        </section>

        {/* Bottom input */}
        <div className="mt-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-full">
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Ask something.."
              />
              <button className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                ↑
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
