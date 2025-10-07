import React from "react";
import InteractiveDashboard from "@/components/InteractiveDashboard";
import EnhancedAddNewInterview from "@/components/EnhancedAddNewInterview";
import EnhancedInterviewList from "@/components/EnhancedInterviewList";

const Dashboard = () => {
  return (
    <InteractiveDashboard>
      <div className="space-y-8">
        <EnhancedAddNewInterview />
        <EnhancedInterviewList />
      </div>
    </InteractiveDashboard>
  );
};

export default Dashboard;
