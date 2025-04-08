
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DepartmentWithEmployeeCount } from '@/types/database';

interface DeleteDepartmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentWithEmployeeCount | null;
  onDelete: () => void;
  isPending: boolean;
}

const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  isOpen,
  onOpenChange,
  department,
  onDelete,
  isPending,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {department?.deptname}? This action cannot be undone.
            {department && department.employee_count > 0 && (
              <p className="mt-2 text-destructive">
                Warning: This department has {department.employee_count} employee{department.employee_count !== 1 && 's'} assigned to it.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending ? 
              'Deleting...' : 
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Department
              </>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDepartmentDialog;
