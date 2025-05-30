
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Building, 
  History, 
  TrendingUp 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Employee, Department, JobHistory, mapEmployeeToDisplay } from '@/types/database';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';

const StatCard = ({ title, value, icon, description }: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  description?: string;
}) => (
  <Card className="card-metric">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 bg-primary/10 rounded-full text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  // Fetch employee count
  const { data: employeeCount = 0, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employeeCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employee')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch department count
  const { data: departmentCount = 0, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departmentCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('department')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch recent job history entries
  const { data: recentJobHistory = [], isLoading: isLoadingJobHistory } = useQuery({
    queryKey: ['recentJobHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobhistory')
        .select(`
          *,
          employee (firstname, lastname),
          department (deptname)
        `)
        .order('effdate', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate average employee salary
  const { data: avgSalary = '0', isLoading: isLoadingSalary } = useQuery({
    queryKey: ['avgSalary'],
    queryFn: async () => {
      // Calculate average directly since RPC function might not exist
      const { data, error } = await supabase
        .from('jobhistory')
        .select('salary');
      
      if (error) throw error;
      
      const sum = (data || []).reduce((acc, curr) => acc + (curr.salary || 0), 0);
      return data && data.length > 0 
        ? `$${(sum / data.length).toFixed(2)}`
        : '$0.00';
    }
  });

  const isLoading = isLoadingEmployees || isLoadingDepartments || isLoadingJobHistory || isLoadingSalary;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your HR management overview</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Employees"
            value={isLoading ? "..." : employeeCount}
            icon={<Users size={20} />}
          />
          <StatCard 
            title="Departments"
            value={isLoading ? "..." : departmentCount}
            icon={<Building size={20} />}
          />
          <StatCard 
            title="Job Changes"
            value={isLoading ? "..." : recentJobHistory.length}
            icon={<History size={20} />}
            description="Recent job transitions"
          />
          <StatCard 
            title="Average Salary"
            value={isLoading ? "..." : avgSalary}
            icon={<TrendingUp size={20} />}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Job Changes</h2>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Code</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : recentJobHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No recent job changes</TableCell>
                  </TableRow>
                ) : (
                  recentJobHistory.map((history: any) => (
                    <TableRow key={history.empno + history.effdate}>
                      <TableCell>
                        {history.employee?.firstname} {history.employee?.lastname}
                      </TableCell>
                      <TableCell>{history.department?.deptname}</TableCell>
                      <TableCell>{history.jobcode}</TableCell>
                      <TableCell>${history.salary?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        {format(new Date(history.effdate), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
