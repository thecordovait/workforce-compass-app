
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  History,
  Search,
  Filter,
  RefreshCw,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { JobHistory, Employee, Department } from '@/types/database';
import DashboardLayout from '@/components/layout/DashboardLayout';

const JobHistoryPage = () => {
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Fetch job history
  const { data: jobHistory = [], isLoading: isLoadingJobHistory, refetch } = useQuery({
    queryKey: ['jobHistory', employeeFilter, departmentFilter],
    queryFn: async () => {
      let query = supabase
        .from('job_history')
        .select(`
          *,
          employees(id, first_name, last_name),
          departments(id, name)
        `)
        .order('start_date', { ascending: false });
      
      if (employeeFilter) {
        query = query.eq('employee_id', employeeFilter);
      }
      
      if (departmentFilter) {
        query = query.eq('department_id', departmentFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employeesDropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departmentsDropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleClearFilters = () => {
    setEmployeeFilter('');
    setDepartmentFilter('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job History</h1>
          <p className="text-muted-foreground">Track employee job transitions and career progression</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(employeeFilter || departmentFilter) && (
                    <span className="ml-1 rounded-full bg-primary w-2 h-2"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter job history by employee or department
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label htmlFor="employee" className="text-sm font-medium leading-none">
                        Employee
                      </label>
                      <Select
                        value={employeeFilter}
                        onValueChange={setEmployeeFilter}
                      >
                        <SelectTrigger id="employee">
                          <SelectValue placeholder="All Employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Employees</SelectItem>
                          {employees.map((employee: Employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="department" className="text-sm font-medium leading-none">
                        Department
                      </label>
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Departments</SelectItem>
                          {departments.map((department: Department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearFilters}
                      disabled={!employeeFilter && !departmentFilter}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {(employeeFilter || departmentFilter) && (
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-muted text-muted-foreground rounded-md px-2 py-1">
                  {employeeFilter && employees.find((e: Employee) => e.id === employeeFilter) && (
                    <span className="inline-flex items-center">
                      Employee: {employees.find((e: Employee) => e.id === employeeFilter)?.first_name} {employees.find((e: Employee) => e.id === employeeFilter)?.last_name}
                    </span>
                  )}
                  {departmentFilter && departments.find((d: Department) => d.id === departmentFilter) && (
                    <span className="inline-flex items-center">
                      {employeeFilter && ' • '}
                      Department: {departments.find((d: Department) => d.id === departmentFilter)?.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Previous Position</TableHead>
                <TableHead>New Position</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingJobHistory ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : jobHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No job history records found</TableCell>
                </TableRow>
              ) : (
                jobHistory.map((history: any) => (
                  <TableRow key={history.id}>
                    <TableCell className="font-medium">
                      {history.employees?.first_name} {history.employees?.last_name}
                    </TableCell>
                    <TableCell>{history.departments?.name}</TableCell>
                    <TableCell>{history.previous_job_title}</TableCell>
                    <TableCell>{history.new_job_title}</TableCell>
                    <TableCell>
                      {history.start_date && format(new Date(history.start_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {history.end_date 
                        ? format(new Date(history.end_date), 'MMM d, yyyy')
                        : 'Current'
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobHistoryPage;
