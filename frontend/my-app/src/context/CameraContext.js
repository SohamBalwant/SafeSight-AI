import React, { createContext, useState } from "react";

export const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [cameraData, setCameraData] = useState([
    { id: 1, cam: "CAM 1", camId: "cam1" },
    { id: 1, cam: "CAM 2", camId: "cam1" },
    { id: 1, cam: "CAM 3", camId: "cam1" },
    { id: 1, cam: "CAM 4", camId: "cam1" },
  ]);

  const updateCameraName = (id, newName) => {
    setCameraData((prevData) =>
      prevData.map((camera) =>
        camera.id === id ? { ...camera, cam: newName } : camera
      )
    );
  };

  return (
    <CameraContext.Provider value={{ cameraData, updateCameraName }}>
      {children}
    </CameraContext.Provider>
  );
};