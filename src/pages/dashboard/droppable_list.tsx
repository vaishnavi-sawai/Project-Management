import { useDrop } from "react-dnd";
import { DotsIcon, PlusIcon } from "~/components/icons/icon_component";
import { TaskCard } from "../project_and_tasks/task_card";
import type { DroppableListProps } from "~/types/project";

export const DroppableList = ({
  list,
  onCardDrop,
  onAddCardClick,
  activeAddCardList,
  newCardTitle,
  setNewCardTitle,
  newCardDescription,
  setNewCardDescription,
  submitNewCard,
  cancelNewCard,
  loadingListIds,
  onTaskUpdate,
}: DroppableListProps) => {
  const listStatus = list.id.split("-")[1];

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string; status: string }) => {
      if (item.status !== listStatus && listStatus) {
        onCardDrop(item.id, item.status, listStatus ?? "");
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div key={list.id} className="w-72 flex-shrink-0">
      <div className="mb-2 flex items-center justify-between px-2">
        <h2 className="font-medium text-white">{list.title}</h2>
        <div className="flex items-center">
          <span className="bg-opacity-20 mr-2 rounded-full bg-white px-2 py-0.5 text-xs text-white">
            {list.cards.length}
          </span>
          <button className="text-white opacity-70 hover:opacity-100">
            <DotsIcon />
          </button>
        </div>
      </div>

      <div
        ref={drop as unknown as React.RefObject<HTMLDivElement>}
        className={`bg-opacity-20 min-h-10 rounded bg-purple-800 p-2 ${
          isOver ? "bg-opacity-30 bg-purple-600" : ""
        }`}
      >
        {list.cards.map((card) => (
          <TaskCard key={card.id} card={card} onTaskUpdate={onTaskUpdate} />
        ))}

        {activeAddCardList === list.id ? (
          <div className="mt-2 rounded bg-white p-2 shadow">
            <input
              type="text"
              placeholder="Enter card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="mb-2 w-full rounded border border-gray-300 p-2 text-sm focus:border-purple-500 focus:outline-none"
              autoFocus
            />
            <textarea
              placeholder="Enter description (optional)..."
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              className="mb-2 w-full rounded border border-gray-300 p-2 text-sm focus:border-purple-500 focus:outline-none"
              rows={3}
            />
            <div className="flex justify-between">
              <button
                className="rounded bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700"
                onClick={() => submitNewCard(list.id)}
                disabled={loadingListIds[list.id] ?? !newCardTitle.trim()}
              >
                {loadingListIds[list.id] ? "Adding..." : "Add Card"}
              </button>
              <button
                className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                onClick={cancelNewCard}
                disabled={loadingListIds[list.id]}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="hover:bg-opacity-30 flex w-full items-center rounded p-1.5 text-sm text-white hover:bg-purple-700"
            onClick={() => onAddCardClick(list.id)}
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
};
