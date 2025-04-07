
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  salary: number;
  department_id: string;
  job_title: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  location: string;
  manager_id: string | null;
  created_at: string;
}

export interface JobHistory {
  id: string;
  employee_id: string;
  department_id: string;
  previous_job_title: string;
  new_job_title: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface DepartmentWithEmployeeCount extends Department {
  employee_count: number;
}
