import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import OrganizationChart from '../components/OrganizationChart';

interface Department {
  id: number;
  name: string;
}

const OrganizationPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/departments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    }
  });

  // Set the first department as default when departments are loaded
  useEffect(() => {
    if (departments.length > 0 && selectedDepartment === 0) {
      setSelectedDepartment(departments[0].id);
    }
  }, [departments]);

  if (departments.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px] text-text-secondary">
          <p>No departments available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-primary rounded-lg shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Organization Chart</h1>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-medium">Showing:</span>
            <select
              className="input-field py-2"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(Number(e.target.value))}
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-primary rounded-lg shadow-sm">
        <OrganizationChart departmentId={selectedDepartment} />
      </div>
    </div>
  );
};

export default OrganizationPage;
