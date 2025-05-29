import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import {
  BellIcon,
  ChevronDownIcon,
  DotsIcon,
  StarIcon,
} from "~/components/icons/icon_component";
import type { Project } from "~/types/project";

export const DashboardHeader = ({
  selectedProject,
  handleBackToProjects,
  getUserInitials,
}: {
  selectedProject: Project | null;
  handleBackToProjects: () => void;
  getUserInitials: () => string | undefined;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
    });

    await router.push("/sign_in_sign_out/sign_in");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center">
        {selectedProject ? (
          <>
            <button
              onClick={handleBackToProjects}
              className="mr-2 text-white hover:text-purple-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <h1 className="mr-4 text-lg font-semibold text-white">
              {selectedProject.name}
            </h1>
          </>
        ) : (
          <h1 className="mr-4 text-lg font-semibold text-white">Dashboard</h1>
        )}
        {selectedProject && (
          <button className="bg-opacity-30 flex items-center rounded bg-purple-800 px-2 py-1 text-white">
            <span className="mr-1">⌘</span>
            <ChevronDownIcon />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button className="bg-opacity-30 rounded bg-purple-800 p-1.5 text-white">
          <span className="text-sm font-semibold">{getUserInitials()}</span>
        </button>
        <button className="text-white">
          <BellIcon />
        </button>
        <button className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
            />
          </svg>
        </button>
        {selectedProject && (
          <>
            <button className="text-white">
              <StarIcon />
            </button>
            <button className="bg-opacity-20 hover:bg-opacity-30 flex items-center space-x-1 rounded bg-white px-3 py-1.5 text-white">
              <span className="text-sm font-medium">Share</span>
            </button>
          </>
        )}
        <div className="relative">
          <button
            className="text-white"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <DotsIcon />
          </button>

          {showDropdown && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </header>
  );
};
