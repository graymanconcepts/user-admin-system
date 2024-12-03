import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UserNode {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  subordinates: UserNode[];
}

interface OrganizationChartProps {
  departmentId?: number | 'all';
}

const NodeContent: React.FC<{ node: UserNode }> = ({ node }) => {
  const getRoleColor = (role?: string) => {
    if (!role) return 'bg-gray-500 text-white';
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-status-error text-white';
      case 'manager':
        return 'bg-status-info text-white';
      case 'employee':
        return 'bg-status-success text-white';
      case 'contractor':
        return 'bg-status-warning text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="bg-primary rounded-lg shadow-md p-2 w-48 mb-4 mx-auto">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-2">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <div className="font-semibold text-text-primary">{node.name || 'Unknown'}</div>
          <div className="text-sm text-text-secondary">{node.email || ''}</div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(node.role)}`}>
              {node.role || 'No Role'}
            </span>
          </div>
          <div className="text-xs text-text-disabled mt-1">{node.department || 'No Department'}</div>
        </div>
      </div>
    </div>
  );
};

const OrganizationChart: React.FC<OrganizationChartProps> = ({ departmentId = 'all' }) => {
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization', departmentId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const url = departmentId === 'all' 
        ? '/api/organization-tree' 
        : `/api/organization-tree?departmentId=${departmentId}`;
      console.log('Fetching org data from:', url);
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Received org data:', data);
      return data;
    }
  });

  console.log('Current departmentId:', departmentId);
  console.log('Organization Data:', orgData);
  console.log('Is Array?:', Array.isArray(orgData));
  console.log('Length if array:', Array.isArray(orgData) ? orgData.length : 'Not an array');
  console.log('Has ID if object:', !Array.isArray(orgData) && orgData ? !!orgData.id : 'Is array or null');

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading organization chart...</div>;
  }

  if (!orgData || 
      (Array.isArray(orgData) && orgData.length === 0) || 
      (!Array.isArray(orgData) && (!orgData.subordinates || orgData.subordinates.length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-secondary">
        <div className="w-16 h-16 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <User className="w-8 h-8 text-accent" />
        </div>
        <p className="text-lg font-medium text-text-primary">No Personnel Found</p>
        <p className="text-sm">There are no people assigned to this department yet.</p>
      </div>
    );
  }

  const renderOrganization = (node: UserNode) => (
    <TreeNode key={node.id} label={<NodeContent node={node} />}>
      {node.subordinates?.map((subordinate: UserNode) => renderOrganization(subordinate))}
    </TreeNode>
  );

  return (
    <div className="p-4 overflow-auto relative w-full min-h-[800px]">
      <div className="absolute left-1/2 transform -translate-x-1/2 pt-8 w-full flex justify-center">
        {Array.isArray(orgData) ? (
          <div className="flex flex-col gap-8 items-center">
            {orgData.map((rootNode: UserNode) => (
              <div className="flex justify-center">
                <Tree
                  key={rootNode.id}
                  lineWidth="2px"
                  lineColor="#718096"
                  lineBorderRadius="6px"
                  lineHeight="50px"
                  nodePadding="40px"
                  label={<NodeContent node={rootNode} />}
                >
                  {rootNode.subordinates?.map((subordinate: UserNode) => renderOrganization(subordinate))}
                </Tree>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <Tree
              lineWidth="2px"
              lineColor="#718096"
              lineBorderRadius="6px"
              lineHeight="50px"
              nodePadding="40px"
              label={<NodeContent node={orgData} />}
            >
              {orgData.subordinates?.map((subordinate: UserNode) => renderOrganization(subordinate))}
            </Tree>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationChart;
