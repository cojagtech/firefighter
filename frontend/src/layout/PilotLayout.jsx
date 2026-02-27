import { Outlet } from "react-router-dom";
import PilotSidebar from "../components/common/pilot/Sidebar";
import PilotHeader from "../components/common/pilot/PilotHeader";
import "./PilotLayout.css";

const PilotLayout = () => {
  return (
    <div className="pilot-layout">
      <PilotHeader />
      <div className="pilot-layout__body">
        <PilotSidebar />
        <main className="pilot-layout__main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PilotLayout;