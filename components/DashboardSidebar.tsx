import { Compass, File, History, Library } from "lucide-react";
import Image from "next/image";

function DashboardSidebar({
  user,
  displayName,
}: {
  user: any;
  displayName: string;
}) {
  return (
    <aside className="w-1/5 bg-gray-50 border-r border-gray-100 flex flex-col justify-between h-screen">
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
          <div className="text-xs text-gray-500 mb-2">Diagnostics</div>
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
        ) : null}
        <div className="text-sm font-semibold">{displayName}</div>
      </div>
    </aside>
  );
}
export default DashboardSidebar;
