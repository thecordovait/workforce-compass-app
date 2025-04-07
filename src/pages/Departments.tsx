
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Building,
  Users,
  PlusCircle,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Department, DepartmentWithEmployeeCount } from '@/types/database';
import DashboardLayout from '@/components/layout/DashboardLayout';

const departmentFormSchema = z.object({
  name: z.string().min(1, { message: 'Department name is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const Departments = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentWithEmployeeCount | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch departments with employee count
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departmentsWithCount'],
    queryFn: async () => {
      // Try to use a custom RPC function first
      try {
        const { data, error } = await supabase.rpc('get_departments_with_employee_count');
        if (error) throw error;
        return data || [];
      } catch (rpcError) {
        // Fallback to manual join if RPC isn't available
        console.log('RPC not available, using manual join');
        
        // First get all departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .order('name', { ascending: true });
        
        if (deptError) throw deptError;
        
        // Then get employee counts per department
        const { data: countData, error: countError } = await supabase
          .from('employees')
          .select('department_id, count')
          .select('department_id')
          .select('count', { count: 'exact' })
          .groupBy('department_id');
        
        if (countError) throw countError;
        
        // Combine the data
        const departmentsWithCount = deptData.map((dept: Department) => {
          const countInfo = countData.find((c: any) => c.department_id === dept.id);
          return {
            ...dept,
            employee_count: countInfo ? countInfo.count : 0
          };
        });
        
        return departmentsWithCount || [];
      }
    },
  });

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (newDepartment: Omit<Department, 'id' | 'created_at' | 'manager_id'>) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([{ ...newDepartment, manager_id: null }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentsWithCount'] });
      queryClient.invalidateQueries({ queryKey: ['departmentCount'] });
      toast({
        title: 'Success',
        description: 'Department has been added',
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add department: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, name, location }: Partial<Department> & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update({ name, location })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentsWithCount'] });
      toast({
        title: 'Success',
        description: 'Department has been updated',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update department: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentsWithCount'] });
      queryClient.invalidateQueries({ queryKey: ['departmentCount'] });
      toast({
        title: 'Success',
        description: 'Department has been deleted',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete department: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Forms
  const addForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const editForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  // Handlers
  const handleAddDepartment = (data: DepartmentFormValues) => {
    addDepartmentMutation.mutate(data);
  };

  const handleUpdateDepartment = (data: DepartmentFormValues) => {
    if (selectedDepartment) {
      updateDepartmentMutation.mutate({
        ...data,
        id: selectedDepartment.id,
      });
    }
  };

  const handleDeleteDepartment = () => {
    if (selectedDepartment) {
      deleteDepartmentMutation.mutate(selectedDepartment.id);
    }
  };

  const openEditDialog = (department: DepartmentWithEmployeeCount) => {
    setSelectedDepartment(department);
    editForm.reset({
      name: department.name,
      location: department.location,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (department: DepartmentWithEmployeeCount) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Manage your organization's departments</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-hrm-600 hover:bg-hrm-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </div>

        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No departments found</TableCell>
                </TableRow>
              ) : (
                departments.map((department: DepartmentWithEmployeeCount) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.location}</TableCell>
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
                          onClick={() => openEditDialog(department)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(department)}
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
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Enter the details for the new department
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddDepartment)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-hrm-600 hover:bg-hrm-700 text-white"
                  disabled={addDepartmentMutation.isPending}
                >
                  {addDepartmentMutation.isPending ? 'Adding...' : 'Add Department'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the department details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateDepartment)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-hrm-600 hover:bg-hrm-700 text-white"
                  disabled={updateDepartmentMutation.isPending}
                >
                  {updateDepartmentMutation.isPending ? 'Updating...' : 'Update Department'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDepartment?.name}? This action cannot be undone.
              {selectedDepartment && selectedDepartment.employee_count > 0 && (
                <p className="mt-2 text-destructive">
                  Warning: This department has {selectedDepartment.employee_count} employee{selectedDepartment.employee_count !== 1 && 's'} assigned to it.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteDepartmentMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteDepartment}
              disabled={deleteDepartmentMutation.isPending}
            >
              {deleteDepartmentMutation.isPending ? 
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
    </DashboardLayout>
  );
};

export default Departments;
