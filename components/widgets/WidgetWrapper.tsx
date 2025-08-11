
import React from 'react';
import { X } from 'lucide-react';

interface WidgetWrapperProps {
    children: React.ReactNode;
    isEditMode: boolean;
    onRemove: () => void;
    // Drag-and-drop props can be added here later
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ children, isEditMode, onRemove }) => {
    
    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    return (
        <div className={`relative transition-transform duration-200 ease-in-out ${isEditMode ? 'jiggle' : ''}`}>
            {isEditMode && (
                <button onClick={handleRemoveClick} className="remove-btn">
                    <X size={16} />
                </button>
            )}
            {children}
        </div>
    );
};

export default WidgetWrapper;