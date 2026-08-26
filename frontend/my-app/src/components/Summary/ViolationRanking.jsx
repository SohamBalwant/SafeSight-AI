// File: components/ViolationRanking.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const ViolationRanking = ({ violationRanking }) => {
      const { t } = useTranslation();
  return (
    <div className="card violation-ranking-card">
      <div className="card-body">
        <h5 className="card-title">{t("rank_title")}</h5>
          <div className="detect-list">
            <div className="detect-row d-flex justify-content-between mb-2">
              <span>Worker ID: 01</span>
              <span>7</span>
            </div>
            <div className="detect-row d-flex justify-content-between mb-2">
              <span>Worker ID: 02</span>
              <span>6</span>
            </div>
            <div className="detect-row d-flex justify-content-between mb-2">
              <span>Worker ID: 03</span>
              <span>9</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ViolationRanking;