
import React, { useState } from 'react';

interface KanbanCardData {
  id: string;
  title: string;
  subtitle: string;
  [key: string]: any;
}

interface KanbanColumnData {
  id: string;
  title: string;
}

interface KanbanProps {
  columns: KanbanColumnData[];
  data: KanbanCardData[];
  onCardClick: (item: KanbanCardData) => void;
  onDrop: (itemId: string, newColumnId: string) => void;
}

const KanbanCard: React.FC<{ item: KanbanCardData; onClick: () => void; onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void }> = ({ item, onClick, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={onClick}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-500 cursor-pointer mb-3 transition-all"
    >
      <h4 className="font-bold text-sm text-gray-800">{item.title}</h4>
      <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
    </div>
  );
};

const KanbanColumn: React.FC<{
  column: KanbanColumnData;
  items: KanbanCardData[];
  onCardClick: (item: KanbanCardData) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ column, items, onCardClick, onDragStart, onDrop, onDragOver }) => {
  return (
    <div
      className="flex-1 min-w-[280px] bg-gray-50 rounded-xl p-3"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-gray-700">{column.title}</h3>
        <span className="text-sm font-bold text-gray-500 bg-gray-200 rounded-full px-2 py-1">{items.length}</span>
      </div>
      <div>
        {items.map(item => (
          <KanbanCard key={item.id} item={item} onClick={() => onCardClick(item)} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
};

const Kanban: React.FC<KanbanProps> = ({ columns, data, onCardClick, onDrop }) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    if (draggedItemId) {
      onDrop(draggedItemId, columnId);
      setDraggedItemId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
        <div className="flex space-x-4 space-x-reverse">
        {columns.map(col => {
            const items = data.filter(item => item.pipelineStatus === col.id);
            return (
            <KanbanColumn
                key={col.id}
                column={col}
                items={items}
                onCardClick={onCardClick}
                onDragStart={handleDragStart}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
            />
            );
        })}
        </div>
    </div>
  );
};

export default Kanban;
