import React from 'react';
import { Button } from '../ui/Button'; // Assuming Button is in ../ui/Button relative to this file
import { Edit, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    customActions?: React.ReactNode;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete, customActions }) => {
    return (
        <div className="flex justify-end items-center gap-3">
            {customActions}
            {onEdit && (
                <button onClick={onEdit} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Editar">
                    <Edit size={16} />
                </button>
            )}
            {onDelete && (
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Excluir">
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
};
