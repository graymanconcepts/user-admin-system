import { X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  userName 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-300/20">
          <h2 className="text-xl font-semibold text-text-primary">Confirm Delete User</h2>
          <button 
            onClick={onClose}
            className="text-text-disabled hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-text-primary mb-2">
              Are you sure you want to delete user <strong>{userName}</strong>?
            </p>
            <p className="text-text-secondary text-sm">
              This is a destructive action and cannot be undone. All data associated with this user will be permanently deleted.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn-primary bg-status-error hover:bg-status-error/80"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
