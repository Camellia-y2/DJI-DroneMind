"use client";
import React from 'react';

interface ParameterLibraryProps {
  onDroneSelect?: (droneName: string) => void;
}

const ParameterLibrary: React.FC<ParameterLibraryProps> = ({ onDroneSelect }) => {
  // 无人机系列数据
  const droneSeries = [
    {
      name: "Mavic 系列",
      drones: [
        { name: "DJI Mavic 4 Pro", status: "已收录参数", available: true },
        { name: "DJI Mavic 3 Pro", status: "待收录", available: false },
        { name: "DJI Mavic 3 Classic", status: "待收录", available: false },
        { name: "DJI Mavic 3", status: "待收录", available: false },
        { name: "御 Mavic 2", status: "待收录", available: false },
        { name: "御 Mavic Pro", status: "待收录", available: false },
      ]
    },
    {
      name: "Mini 系列",
      drones: [
        { name: "DJI Mini 4 Pro", status: "已收录参数", available: true },
        { name: "DJI Mini 3", status: "待收录", available: false },
        { name: "DJI Mini 4K | DJI Mini 2 SE", status: "待收录", available: false },
      ]
    },
    {
      name: "Air 系列",
      drones: [
        { name: "DJI Air 3s", status: "已收录参数", available: true },
        { name: "DJI Air 3", status: "待收录", available: false },
        { name: "DJI Air 2S", status: "待收录", available: false },
      ]
    },
    {
      name: "Neo 系列",
      drones: [
        { name: "DJI Neo", status: "已收录参数", available: true },
      ]
    },
    {
      name: "Avata 系列",
      drones: [
        { name: "DJI Avata 2", status: "已收录参数", available: true },
      ]
    },
    {
      name: "Inspire 系列",
      drones: [
        { name: "DJI Inspire 3", status: "已收录参数", available: true },
        { name: "悟 Inspire 2", status: "待收录", available: false },
        { name: "悟 Inspire 1 Pro/RAW", status: "待收录", available: false },
        { name: "悟 Inspire 1", status: "待收录", available: false },
      ]
    }
  ];

  const handleDroneClick = (droneName: string, available: boolean) => {
    if (available && onDroneSelect) {
      onDroneSelect(droneName);
    }
  };

  return (
    <div className="space-y-4">
      {droneSeries.map((series, seriesIndex) => (
        <div key={seriesIndex}>
          <h3 className="font-semibold text-[#1A1A1A] mb-2">{series.name}</h3>
          <div className="space-y-1">
            {series.drones.map((drone, droneIndex) => (
              <button
                key={droneIndex}
                onClick={() => handleDroneClick(drone.name, drone.available)}
                disabled={!drone.available}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors duration-200 ${
                  drone.available
                    ? 'hover:bg-[#FFECEC] cursor-pointer'
                    : 'text-[#999999] cursor-not-allowed'
                }`}
              >
                <span className={drone.available ? 'text-[#333333]' : 'text-[#999999]'}>
                  {drone.name}
                </span>
                <span className={`text-xs ml-2 ${
                  drone.available ? 'text-[#666666]' : 'text-[#CCCCCC]'
                }`}>
                  {drone.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParameterLibrary;
