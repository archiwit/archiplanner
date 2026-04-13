import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export const SortableItem = ({ id, children, className = "" }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className={`sortable-item-wrapper ${className} ${isDragging ? 'dragging' : ''}`}>
            <div {...attributes} {...listeners} className="drag-handle">
                <GripVertical size={16} />
            </div>
            <div className="sortable-content">
                {children}
            </div>
        </div>
    );
};

const SortableList = ({ items, onReorder, children, className = "" }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            onReorder(arrayMove(items, oldIndex, newIndex));
        }
    };

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
        >
            <SortableContext 
                items={items.map(item => item.id)} 
                strategy={verticalListSortingStrategy}
            >
                <div className={`sortable-list ${className}`}>
                    {children}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default SortableList;
