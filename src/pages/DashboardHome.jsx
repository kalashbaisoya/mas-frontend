import RoleBasedRenderer from '../components/layout/RoleBasedRenderer';

function DashboardPage() {
    console.log("DashboardPage rendered");
  return (
    
    <div className="flex flex-wrap gap-6 justify-center">
      <RoleBasedRenderer />
    </div>
  );
}

export default DashboardPage;