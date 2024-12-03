import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import OrganizationChart from '../components/OrganizationChart';

interface Department {
  id: number;
  name: string;
}

const OrganizationPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<number | 'all'>('all');

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

  return (
    <div className="p-6">
      <div className="bg-primary rounded-lg shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Organization Chart</h1>
          <select
            className="input-field py-2"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-primary rounded-lg shadow-sm">
        <OrganizationChart departmentId={selectedDepartment} />
      </div>
    </div>
  );
};

export default OrganizationPage;
