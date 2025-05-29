import type { Project } from "~/types/project";

export const ProjectCard = ({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (projectId: string) => void;
}) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString();

  return (
    <div
      className="cursor-pointer rounded-lg bg-white p-4 shadow-md transition-all hover:shadow-lg"
      onClick={() => onSelect(project.id)}
    >
      <h3 className="mb-2 text-lg font-semibold text-gray-800">
        {project.name}
      </h3>
      {project.description && (
        <p className="mb-3 text-sm text-gray-600">{project.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Created: {formattedDate}</span>
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
          {project.tasks?.length || 0} tasks
        </span>
      </div>
    </div>
  );
};
