import { useDrag } from "react-dnd";
import { useState, useEffect } from "react";
import type { Task, User } from "~/types/project";
import { CalendarIcon } from "~/components/icons/icon_component";
import { api } from "~/utils/api";

const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(task.description ?? "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(
    task.assignedToId ?? "",
  );
  const [availableUsers, setAvailableUsers] = useState([] as User[]);

  const {
    data: users = [],
    refetch: refetchUsers,
    isLoading,
  } = api.user.getUsers.useQuery();

  const updateTaskMutation = api.dashboard.updateTask.useMutation({
    onSuccess: () => {
      onTaskUpdate?.();
      setIsEditingDescription(false);
    },
  });

  const deleteTaskMutation = api.dashboard.deleteTask.useMutation({
    onSuccess: () => {
      onClose();
      onTaskUpdate?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setAvailableUsers(users);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      };
      void fetchUsers();
    }
  }, [isOpen, users]);

  if (!isOpen) return null;

  const handleTaskUpdate = (fields) => {
    updateTaskMutation.mutate({ taskId: task.id, ...fields });
  };

  const handleAssigneeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newAssigneeId = e.target.value;
    setSelectedAssignee(newAssigneeId);

    try {
      updateTaskMutation.mutate({
        taskId: task.id,
        assignedToId: newAssigneeId,
      });
    } catch (error) {
      console.error("Failed to update assignee:", error);
      setSelectedAssignee(task.assignedTo?.id ?? "");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 m-4 flex min-h-[500px] w-full max-w-2xl rounded-lg bg-gray-100 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="flex w-full flex-col md:flex-row">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              {task.status && (
                <div className="mb-2">
                  <span className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                    {task.status}
                  </span>
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>

              <p className="mt-1 text-sm text-gray-500">
                in list{" "}
                <span className="font-medium">{task.status || "Unknown"}</span>
              </p>
            </div>
            <div className="mb-6">
              <h3 className="mb-2 flex items-center text-sm font-medium text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                Description
              </h3>

              {isEditingDescription ? (
                <div className="mt-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    placeholder="Add a more detailed description..."
                    autoFocus
                  />
                  <div className="mt-2 flex">
                    <button
                      onClick={() =>
                        handleTaskUpdate({
                          description,
                        })
                      }
                      disabled={isUpdating}
                      className={`rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white ${
                        isUpdating ? "opacity-70" : "hover:bg-blue-600"
                      }`}
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setDescription(task.description ?? "");
                      }}
                      disabled={isUpdating}
                      className="ml-2 rounded px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  {description || "Add a more detailed description..."}
                </div>
              )}
            </div>
          </div>

          <div className="w-full border-t border-gray-200 bg-gray-50 p-6 md:w-64 md:border-t-0 md:border-l">
            <div className="mb-6">
              <div className="space-y-3">
                {task.priority && (
                  <div className="mb-6">
                    <h3 className="mb-1 text-sm font-medium text-gray-700">
                      Priority
                    </h3>
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        handleTaskUpdate({
                          priority: e.target.value,
                        })
                      }
                      className={`rounded border px-2 py-1 text-sm focus:outline-none ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                )}

                {task.createdBy && (
                  <div className="flex items-center rounded p-1 hover:bg-gray-200">
                    <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                      {task?.createdBy?.name?.charAt(0) ??
                        task?.createdBy?.email?.charAt(0) ??
                        "?"}
                    </div>
                    <span className="text-sm text-gray-700">
                      {task?.createdBy?.name ?? task?.createdBy?.email}
                      <span className="ml-1 text-xs text-gray-500">
                        (Creator)
                      </span>
                    </span>
                  </div>
                )}

                <div className="mt-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Assignee
                  </label>
                  <select
                    value={selectedAssignee}
                    onChange={handleAssigneeChange}
                    className="w-full rounded-md border border-gray-300 py-2 pr-10 pl-3 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading}
                  >
                    <option value="">Unassigned</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name ?? user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="mt-4 flex w-full items-center rounded p-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => deleteTaskMutation.mutate({ taskId: task.id })}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v10M9 7h1m-1 4h1m4-4h-1m1 4h-1"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TaskCard = ({
  card,
  onTaskUpdate,
}: {
  card: Task;
  onTaskUpdate?: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: {
      id: card.id,
      status: card.status,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleCardClick = () => {
    // Only open the modal if we're not dragging
    if (!isDragging) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        ref={drag as unknown as React.RefObject<HTMLDivElement>}
        onClick={handleCardClick}
        className={`mb-2 cursor-grab rounded bg-white p-2 shadow ${
          isDragging ? "opacity-50" : ""
        } hover:bg-gray-50`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">{card.title}</h3>
          {card.priority && (
            <span
              className={`rounded px-2 py-0.5 text-xs ${
                card.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : card.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {card.priority}
            </span>
          )}
        </div>

        {card.description && (
          <p className="mb-2 line-clamp-2 text-sm text-gray-600">
            {card.description}
          </p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {/* Creator avatar and tooltip */}
            {card.createdBy && (
              <div className="group relative flex items-center">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700">
                  {card.createdBy.name?.charAt(0) ??
                    card.createdBy.email?.charAt(0) ??
                    "?"}
                </div>
                <span className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 scale-0 rounded bg-gray-800 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                  {card.createdBy.name ?? card.createdBy.email}
                </span>
              </div>
            )}

            {card.deadline && (
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>{new Date(card.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {card.assignedTo && (
            <div className="flex items-center">
              <div className="group relative">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-800">
                  {card.assignedTo.name?.charAt(0) ??
                    card.assignedTo.email?.charAt(0) ??
                    "?"}
                </div>
                <span className="absolute right-0 bottom-full z-10 mb-1 scale-0 rounded bg-gray-800 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                  Assigned: {card.assignedTo.name ?? card.assignedTo.email}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskUpdate={onTaskUpdate}
      />
    </>
  );
};
