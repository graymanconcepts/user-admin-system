import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { User, Printer } from 'lucide-react';
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
  departmentId?: number;
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

const OrganizationChart: React.FC<OrganizationChartProps> = ({ departmentId }) => {
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization', departmentId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const url = `/api/organization-tree?departmentId=${departmentId}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    }
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        body { 
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .org-chart {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .node {
          border: 1px solid #e2e8f0;
          padding: 16px;
          margin: 10px;
          min-width: 200px;
          text-align: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        .node-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: #e2e8f0;
          border-radius: 50%;
          margin-bottom: 8px;
        }
        .name { 
          font-weight: bold;
          font-size: 1.1em;
          color: #1a202c;
        }
        .email { 
          font-size: 0.9em;
          color: #4a5568;
        }
        .role {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8em;
          color: white;
          font-weight: 500;
        }
        .department { 
          font-size: 0.8em;
          color: #718096;
        }
        .role-admin { background-color: #ef4444 !important; }
        .role-manager { background-color: #3b82f6 !important; }
        .role-employee { background-color: #22c55e !important; }
        .role-contractor { background-color: #f59e0b !important; }
        .role-none { background-color: #6b7280 !important; }
        .subordinates {
          position: relative;
          padding-top: 20px;
          margin-top: 20px;
          border-top: 2px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .subordinates::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 50%;
          height: 20px;
          border-left: 2px solid #e2e8f0;
        }
        @media print {
          .no-print { display: none; }
          body { 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .node {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      </style>
    `;

    const renderNode = (node: UserNode): string => {
      const getRoleClass = (role?: string) => {
        if (!role) return 'role-none';
        switch (role.toLowerCase()) {
          case 'admin': return 'role-admin';
          case 'manager': return 'role-manager';
          case 'employee': return 'role-employee';
          case 'contractor': return 'role-contractor';
          default: return 'role-none';
        }
      };

      const subordinatesHtml = node.subordinates?.length
        ? `
          <div class="subordinates">
            ${node.subordinates.map(sub => renderNode(sub)).join('')}
          </div>
        `
        : '';

      return `
        <div class="node">
          <div class="node-content">
            <div class="avatar"></div>
            <div class="name">${node.name || 'Unknown'}</div>
            <div class="email">${node.email || ''}</div>
            <div class="role ${getRoleClass(node.role)}">${node.role || 'No Role'}</div>
            <div class="department">${node.department || 'No Department'}</div>
          </div>
          ${subordinatesHtml}
        </div>
      `;
    };

    const title = `Department Organization Chart - ${orgData?.department || ''}`;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          <div class="org-chart">
            <h1 style="text-align: center; color: #1a202c; margin-bottom: 40px;">${title}</h1>
            ${Array.isArray(orgData) 
              ? orgData.map(node => renderNode(node)).join('')
              : renderNode(orgData)}
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const renderSubordinates = (subordinates: UserNode[] = []) => {
    return subordinates.map((subordinate: UserNode) => (
      <TreeNode key={subordinate.id} label={<NodeContent node={subordinate} />}>
        {renderSubordinates(subordinate.subordinates)}
      </TreeNode>
    ));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading organization chart...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Chart
        </button>
      </div>
      {!orgData || 
        (Array.isArray(orgData) && orgData.length === 0) || 
        (!Array.isArray(orgData) && (!orgData.subordinates || orgData.subordinates.length === 0)) ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-text-secondary">
          <div className="w-16 h-16 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-8 h-8 text-accent" />
          </div>
          <p className="text-lg font-medium text-text-primary">No Personnel Found</p>
          <p className="text-sm">There are no people assigned to this department yet.</p>
        </div>
      ) : (
        <Tree
          lineWidth={'2px'}
          lineColor={'#cbd5e1'}
          lineBorderRadius={'10px'}
          label={<NodeContent node={Array.isArray(orgData) ? orgData[0] : orgData} />}
        >
          {Array.isArray(orgData) ? (
            orgData[0]?.subordinates?.map((subordinate: UserNode) => (
              <TreeNode key={subordinate.id} label={<NodeContent node={subordinate} />}>
                {renderSubordinates(subordinate.subordinates)}
              </TreeNode>
            ))
          ) : (
            renderSubordinates(orgData.subordinates)
          )}
        </Tree>
      )}
    </div>
  );
};

export default OrganizationChart;
