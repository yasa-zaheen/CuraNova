import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { Compass, File, History, Library } from "lucide-react";

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
      <aside className="w-72 bg-gray-50 border-r border-gray-100 flex flex-col justify-between">
        <div>
          <div className="px-4 py-4 flex items-center gap-3 border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold">
              CN
            </div>
            <div className="text-sm font-semibold">CuraNova</div>
          </div>

          <hr className="mx-4" />

          <nav className="px-3 py-4 space-y-1 text-sm text-gray-700">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <Compass className="w-4 h-4" />
              Explore
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <Library className="w-4 h-4" />
              Library
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <File className="w-4 h-4" />
              Files
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <History className="w-4 h-4" />
              History
            </div>
          </nav>

          <hr className="mx-4" />

          <div className="px-4 mt-4">
            <div className="text-xs text-gray-500 mb-2">Recent</div>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-white border border-gray-100 rounded-md text-sm">
                Brainstorming small bussines...
              </div>
            </div>
          </div>
        </div>

        {/* User info at the bottom */}
        <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={displayName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-medium">
              {initials}
            </div>
          )}
          <div className="text-sm font-semibold">{displayName}</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 flex flex-col">
        {/* Greeting */}
        <section className="flex-1 flex flex-col items-start justify-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
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
