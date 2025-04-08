
import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DepartmentWithEmployeeCount } from '@/types/database';

interface DepartmentTableProps {
  departments: DepartmentWithEmployeeCount[];
  isLoading: boolean;
  onEditDepartment: (department: DepartmentWithEmployeeCount) => void;
  onDeleteDepartment: (department: DepartmentWithEmployeeCount) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({ 
  departments, 
  isLoading, 
  onEditDepartment, 
  onDeleteDepartment 
}) => {
  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">Loading...</TableCell>
            </TableRow>
          ) : departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">No departments found</TableCell>
            </TableRow>
          ) : (
            departments.map((department: DepartmentWithEmployeeCount) => (
              <TableRow key={department.deptcode}>
                <TableCell className="font-medium">{department.deptname}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-muted-foreground" />
                    <span>{department.employee_count}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditDepartment(department)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteDepartment(department)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DepartmentTable;
