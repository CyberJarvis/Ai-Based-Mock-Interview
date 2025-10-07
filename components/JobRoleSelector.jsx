import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Briefcase, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const JobRoleSelector = ({ selectedRole, onRoleSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const jobRoles = [
    // Software Development
    { category: 'Software Development', roles: [
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Mobile App Developer (iOS/Android)',
      'DevOps Engineer',
      'Software Engineer',
      'Senior Software Engineer',
      'Lead Developer',
      'Solutions Architect',
      'System Architect'
    ]},
    
    // Data & Analytics
    { category: 'Data & Analytics', roles: [
      'Data Scientist',
      'Data Analyst',
      'Machine Learning Engineer',
      'AI/ML Specialist',
      'Business Intelligence Analyst',
      'Data Engineer',
      'Big Data Engineer',
      'Analytics Manager'
    ]},
    
    // Management & Leadership
    { category: 'Management & Leadership', roles: [
      'Product Manager',
      'Project Manager',
      'Engineering Manager',
      'Tech Lead',
      'CTO',
      'VP of Engineering',
      'Scrum Master',
      'Agile Coach'
    ]},
    
    // Design & UX
    { category: 'Design & UX', roles: [
      'UI/UX Designer',
      'Product Designer',
      'Graphic Designer',
      'Web Designer',
      'Design Lead',
      'Creative Director'
    ]},
    
    // Cybersecurity
    { category: 'Cybersecurity', roles: [
      'Cybersecurity Analyst',
      'Security Engineer',
      'Penetration Tester',
      'Security Architect',
      'Information Security Manager',
      'Compliance Officer'
    ]},
    
    // Cloud & Infrastructure
    { category: 'Cloud & Infrastructure', roles: [
      'Cloud Engineer',
      'AWS Solutions Architect',
      'Azure Developer',
      'Google Cloud Engineer',
      'Site Reliability Engineer (SRE)',
      'Infrastructure Engineer',
      'Platform Engineer'
    ]},
    
    // Quality Assurance
    { category: 'Quality Assurance', roles: [
      'QA Engineer',
      'Test Automation Engineer',
      'Manual Tester',
      'Performance Tester',
      'QA Manager',
      'Quality Analyst'
    ]},
    
    // Sales & Marketing
    { category: 'Sales & Marketing', roles: [
      'Sales Engineer',
      'Technical Sales Representative',
      'Digital Marketing Specialist',
      'Growth Hacker',
      'Marketing Manager',
      'Business Development Manager'
    ]},
    
    // Consulting & Support
    { category: 'Consulting & Support', roles: [
      'Technical Consultant',
      'Solutions Consultant',
      'Customer Success Manager',
      'Technical Support Engineer',
      'Implementation Specialist',
      'Pre-sales Engineer'
    ]}
  ];

  const filteredRoles = jobRoles.map(category => ({
    ...category,
    roles: category.roles.filter(role => 
      role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.roles.length > 0);

  const handleRoleSelect = (role) => {
    onRoleSelect(role);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomRole('');
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim()) {
      onRoleSelect(customRole.trim());
      setShowCustomInput(false);
      setCustomRole('');
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Job Role/Position *
      </label>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-3 text-left"
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className={selectedRole ? "text-gray-900" : "text-gray-500"}>
                {selectedRole || "Select a job role or enter custom"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
          {/* Search */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search job roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Custom Role Input */}
          {!showCustomInput ? (
            <DropdownMenuItem
              onClick={() => setShowCustomInput(true)}
              className="text-blue-600 font-medium"
            >
              + Add Custom Role
            </DropdownMenuItem>
          ) : (
            <div className="p-2 space-y-2">
              <Input
                placeholder="Enter custom job role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomRoleSubmit()}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleCustomRoleSubmit}
                  disabled={!customRole.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomRole('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Role Categories */}
          {filteredRoles.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {category.category}
              </div>
              {category.roles.map((role, roleIndex) => (
                <DropdownMenuItem
                  key={`${categoryIndex}-${roleIndex}`}
                  onClick={() => handleRoleSelect(role)}
                  className="pl-4 cursor-pointer hover:bg-blue-50"
                >
                  {role}
                </DropdownMenuItem>
              ))}
              {categoryIndex < filteredRoles.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </div>
          ))}
          
          {filteredRoles.length === 0 && searchTerm && (
            <div className="p-4 text-center text-gray-500">
              No roles found matching "{searchTerm}"
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedRole && (
        <p className="text-xs text-gray-500">
          Selected: <span className="font-medium text-gray-700">{selectedRole}</span>
        </p>
      )}
    </div>
  );
};

export default JobRoleSelector;