import React from "react";
import { useCurrentUser } from "@/hooks/useAuth";

export const Header: React.FC = () => {
  const { data: user, error } = useCurrentUser();

  return (
    <>
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error.message}
        </div>
      ) : (
        <header className="bg-white shadow-sm border-b px-6 py-4 ">
          <div className="flex justify-between items-center">
            <div className="flex-col flex items-start justify-cetner">
              <h2 className="text-lg font-semibold text-gray-800">
                Bonjour, {user?.first_name || user?.username}
              </h2>
              <p className="text-sm text-gray-600">
                Bienvenue dans votre espace de gestion
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* <button className="p-2 text-gray-600 hover:text-gray-800">
            <span className="sr-only">Notifications</span>
            🔔
          </button> */}
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0] || user?.username?.[0] || "U"}
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
};
