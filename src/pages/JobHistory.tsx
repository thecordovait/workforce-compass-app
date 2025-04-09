import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JobHistoryPage() {
  const supabase = createClient();

  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);

  // Main Query
  const {
    data: jobHistory,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["jobHistory", employeeFilter, departmentFilter],
    queryFn: async () => {
      let query = supabase
        .from("job_history")
        .select("job_code, employee:empno(firstname, lastname), department:deptcode(deptname)")
        .order("job_code", { ascending: false });

      if (employeeFilter) query = query.eq("empno", employeeFilter);
      if (departmentFilter) query = query.eq("deptcode", departmentFilter);

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Supporting Queries for Filters
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employee").select("empno, firstname, lastname");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("department").select("deptcode, deptname");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Job History</h1>

        <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by:</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Employee Filter */}
            <div className="px-2 py-1">
              <label className="text-sm text-muted-foreground">Employee</label>
              <Select
                value={employeeFilter}
                onValueChange={(val) => {
                  setEmployeeFilter(val);
                  refetch();
                  setFilterOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.empno} value={employee.empno}>
                      {employee.firstname} {employee.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="px-2 py-1">
              <label className="text-sm text-muted-foreground">Department</label>
              <Select
                value={departmentFilter}
                onValueChange={(val) => {
                  setDepartmentFilter(val);
                  refetch();
                  setFilterOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.deptcode} value={department.deptcode}>
                      {department.deptname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(employeeFilter || departmentFilter) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={false}
                  onCheckedChange={() => {
                    setEmployeeFilter(undefined);
                    setDepartmentFilter(undefined);
                    refetch();
                    setFilterOpen(false);
                  }}
                >
                  Clear filters
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filter Labels */}
      {(employeeFilter || departmentFilter) && (
        <div className="mb-4">
          <div className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-sm inline-block">
            {employeeFilter && (
              <span className="inline-flex items-center">
                Employee:{" "}
                {employees.find((e) => e.empno === employeeFilter)?.firstname}{" "}
                {employees.find((e) => e.empno === employeeFilter)?.lastname}
              </span>
            )}
            {employeeFilter && departmentFilter && <span className="mx-2">•</span>}
            {departmentFilter && (
              <span className="inline-flex items-center">
                Department:{" "}
                {departments.find((d) => d.deptcode === departmentFilter)?.deptname}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job History Cards */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {jobHistory?.map((job: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Job Code: {job.job_code}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Employee: {job.employee.firstname} {job.employee.lastname}
                </p>
                <p>Department: {job.department.deptname}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
