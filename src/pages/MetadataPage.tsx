import { useState } from 'react';
import DepartmentsTab from '../components/DepartmentsTab';
import RolesTab from '../components/RolesTab';

type Tab = 'departments' | 'roles';

export default function MetadataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('departments');

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Metadata Management</h1>
      
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 font-medium text-lg transition-colors duration-200 border-b-2 -mb-[1px] ${
            activeTab === 'departments'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 font-medium text-lg transition-colors duration-200 border-b-2 -mb-[1px] ${
            activeTab === 'roles'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Roles
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'roles' && <RolesTab />}
      </div>
    </div>
  );
}
