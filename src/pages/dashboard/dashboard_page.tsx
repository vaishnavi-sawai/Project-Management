import { useState, useEffect } from "react";
import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { type Project } from "~/types/project";
import {
  CalendarIcon,
  PlusIcon,
  TableIcon,
} from "~/components/icons/icon_component";
import { CreateProjectModal } from "../project_and_tasks/project_modal";
import { ProjectCard } from "../project_and_tasks/project_card";
import { DroppableList } from "./droppable_list";
import { DashboardHeader } from "./dashboard_header";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/sign_in_sign_out/sign_in",
        permanent: false,
      },
    };
  }

  return { props: { session } };
};

export default function DashboardPage() {
  const { data: sessionData } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProjectSelection, setShowProjectSelection] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeAddCardList, setActiveAddCardList] = useState<string | null>(
    null,
  );
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [loadingListIds, setLoadingListIds] = useState<Record<string, boolean>>(
    {},
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const {
    data: fetchedProjects = [],
    refetch: refetchProjects,
    isLoading,
  } = api.dashboard.fetchProjects.useQuery();

  const createProject = api.dashboard.createProject.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      refetchProjects();
      setIsCreatingProject(false);
    },
    onError: (err) => {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
      setIsCreatingProject(false);
    },
  });

  const updateTaskMutation = api.dashboard.updateTask.useMutation({
    onError: (err) => {
      console.error("Error updating task status:", err);
      setError("Failed to update task status. Please try again.");
    },
  });

  const createTaskMutation = api.dashboard.createTask.useMutation({
    onSuccess: () => {
      refetchProjects();
      setActiveAddCardList(null);
    },
    onError: (err) => {
      console.error("Error creating task:", err);
    },
  });

  useEffect(() => {
    const processed = fetchedProjects.map((project: Project) => {
      const todoTasks = project.tasks.filter((t) => t.status === "TODO");
      const inProgressTasks = project.tasks.filter(
        (t) => t.status === "IN_PROGRESS",
      );
      const doneTasks = project.tasks.filter((t) => t.status === "DONE");

      return {
        ...project,
        lists: [
          { id: `${project.id}-todo`, title: "To Do", cards: todoTasks },
          {
            id: `${project.id}-inprogress`,
            title: "In Progress",
            cards: inProgressTasks,
          },
          { id: `${project.id}-done`, title: "Done", cards: doneTasks },
        ],
      };
    });

    setProjects(processed);
  }, [fetchedProjects]);

  const selectedProject = selectedProjectId
    ? (projects.find((p) => p.id === selectedProjectId) ?? null)
    : null;

  const handleCreateProject = (name: string, description: string) => {
    setIsCreatingProject(true);
    createProject.mutate({ name, description });
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowProjectSelection(false);
  };

  const handleBackToProjects = () => {
    setShowProjectSelection(true);
    setSelectedProjectId(null);
  };

  const handleAddCardClick = (listId: string) => {
    setActiveAddCardList(listId);
    setNewCardTitle("");
    setNewCardDescription("");
  };
  const mapStatus = (status: string): "TODO" | "IN_PROGRESS" | "DONE" => {
    switch (status.toLowerCase()) {
      case "todo":
        return "TODO";
      case "inprogress":
      case "in_progress":
        return "IN_PROGRESS";
      case "done":
        return "DONE";
      default:
        throw new Error("Invalid status: " + status);
    }
  };
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const mappedStatus = mapStatus(newStatus);
      await updateTaskMutation.mutateAsync({
        taskId,
        status: mappedStatus,
      });
    } catch (err) {}
  };

  const handleCardDrop = async (
    cardId: string,
    sourceStatus: string,
    targetStatus: string,
  ) => {
    if (sourceStatus === targetStatus || updatingTaskId) return;

    setUpdatingTaskId(cardId);

    try {
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id === selectedProjectId) {
            const taskToMove = project.tasks.find((task) => task.id === cardId);
            if (!taskToMove) return project;

            const updatedTask = { ...taskToMove, status: targetStatus };
            const updatedTasks = project.tasks.map((task) =>
              task.id === cardId ? updatedTask : task,
            );

            return {
              ...project,
              tasks: updatedTasks,
              lists: project.lists?.map((list) => {
                const listStatus = list.id.split("-")[1];
                return {
                  ...list,
                  cards: updatedTasks.filter(
                    (task) => task.status === listStatus,
                  ),
                };
              }),
            };
          }
          return project;
        }),
      );

      await updateTaskStatus(cardId, targetStatus);
      await refetchProjects();
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task status. Please try again.");
      await refetchProjects();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const submitNewCard = async (listId: string) => {
    if (!selectedProject || !newCardTitle.trim()) return;

    const statusMatch = /-([^-]+)$/.exec(listId);
    if (!statusMatch) return;

    const status = statusMatch[1];
    setLoadingListIds((prev) => ({ ...prev, [listId]: true }));
    console.log({ status });
    try {
      await createTaskMutation.mutateAsync({
        projectId: selectedProject.id,
        title: newCardTitle.trim(),
        description: newCardDescription.trim(),
        status: mapStatus(mapStatus(status ?? "") || "TODO"),
      });
      setActiveAddCardList(null);
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task. Please try again.");
    } finally {
      setLoadingListIds((prev) => ({ ...prev, [listId]: false }));
    }
  };

  const cancelNewCard = () => {
    setActiveAddCardList(null);
  };

  const getUserInitials = () => {
    if (!sessionData?.user?.name) return "?";

    const nameParts = sessionData.user.name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-purple-400">
      <DashboardHeader
        selectedProject={selectedProject}
        handleBackToProjects={handleBackToProjects}
        getUserInitials={getUserInitials}
      />

      {error && (
        <div className="mx-auto mt-2 max-w-md rounded-md bg-red-50 p-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1">
        {showProjectSelection ? (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your Projects</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
                disabled={isCreatingProject}
              >
                <PlusIcon className="mr-1" />
                <span>{isCreatingProject ? "Creating..." : "New Project"}</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center">
                <div className="mt-10 text-white">Loading projects...</div>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={handleSelectProject}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-purple-200 p-3">
                  <PlusIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  No projects yet
                </h3>
                <p className="mb-4 text-purple-200">
                  Create your first project to get started
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
                  disabled={isCreatingProject}
                >
                  {isCreatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className="flex flex-1 space-x-4 overflow-x-auto p-4">
              {selectedProject?.lists?.map((list) => (
                <DroppableList
                  key={list.id}
                  list={list}
                  onCardDrop={handleCardDrop}
                  onAddCardClick={handleAddCardClick}
                  activeAddCardList={activeAddCardList}
                  newCardTitle={newCardTitle}
                  setNewCardTitle={setNewCardTitle}
                  newCardDescription={newCardDescription}
                  setNewCardDescription={setNewCardDescription}
                  submitNewCard={submitNewCard}
                  cancelNewCard={cancelNewCard}
                  loadingListIds={loadingListIds}
                  onTaskUpdate={refetchProjects}
                />
              ))}
            </div>
          </DndProvider>
        )}
      </div>

      {selectedProject && (
        <div className="flex justify-center pb-4">
          <div className="bg-opacity-60 flex space-x-4 rounded-lg bg-gray-900 px-2 py-1.5">
            <button className="p-1.5 text-gray-400 hover:text-white"></button>
            <button className="p-1.5 text-gray-400 hover:text-white">
              <CalendarIcon />
            </button>
            <button className="border-b-2 border-blue-500 p-1.5 text-blue-500">
              <TableIcon />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-white"></button>
          </div>
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
