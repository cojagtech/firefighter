import { useState } from "react";
import SelectDroneDropDown from "./SelectDroneDropdown";
import Header from "./Header";
import QuickStats from "./QuickStats";

export default function DroneDashboard() {
  const [selectedDrone, setSelectedDrone] = useState(null);

  return (
    <div className="space-y-6 p-6">
      <SelectDroneDropDown
        selectedDrone={selectedDrone}
        setSelectedDrone={setSelectedDrone}
      />

      <Header selectedDrone={selectedDrone} />

      <QuickStats selectedDrone={selectedDrone} />
    </div>
  );
}