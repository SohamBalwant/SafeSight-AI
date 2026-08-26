// ==== Summary.jsx (Refactored with Components) ====
import React, { useState, useEffect, useCallback } from "react";
import SafetyScoreCard from "../components/Summary/SafetyScoreCard";
import TrendAnalysisChart from "../components/Summary/TrendAnalysisChart";
import IncidentDistributionChart from "../components/Summary/IncidentDistributionChart";
import HeatmapOverview from "../components/Summary/HeatmapOverview";
import ViolationRanking from "../components/Summary/ViolationRanking";
import "../assets/components/_summary.scss";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Summary = () => {
  const { t } = useTranslation();

  // Helper functions to get today's date and 7 days ago in 'sv-SE' format
  const getToday = () => new Date().toLocaleDateString('sv-SE');
  const get7DaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString('sv-SE');
  };

  const [startDate, setStartDate] = useState(get7DaysAgo());
  const [endDate, setEndDate] = useState(getToday());

  const [incidentTrendData, setIncidentTrendData] = useState({});
  const [safetyStats, setSafetyStats] = useState([]);

  const [heatmap_week, Setheatmap_week] = useState([])
  const [incidentDistributionData, setIncidentDistributionData] = useState({});
  const [safetyScore, setSafetyScore] = useState(0.72);
  const [violationRanking, setViolationRanking] = useState([]);


  useEffect(() => {
    axios.get(`http://localhost:8000/api/summary?from_date=${startDate}&to_date=${endDate}`)
      .then(res => {
          Setheatmap_week([
              ["Monday", ...res.data[1]['heat_map_mon'], "2025-02-10"],
              ["Tuesday", ...res.data[1]['heat_map_tue'], "2025-02-11"],
              ["Wednesday", ...res.data[1]['heat_map_wed'], "2025-02-12"],
              ["Thursday", ...res.data[1]['heat_map_thu'], "2025-02-13"],
              ["Friday", ...res.data[1]['heat_map_fri'], "2025-02-14"],
              ["Saturday", ...res.data[1]['heat_map_sat'], "2025-02-15"],
              ["Sunday", ...res.data[1]['heat_map_sun'], "2025-02-16"],
            ])
          setIncidentTrendData({
              labels: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              datasets: [
                { label: "No Helmet", data: [...res.data[2]['graph_alert1']], borderColor: "green", fill: false, dates: ["2025-02-11", "2025-02-12", "2025-02-13", "2025-02-14", "2025-02-15", "2025-02-16"] },
                { label: "No Vest", data: [...res.data[2]['graph_alert2']], borderColor: "red", fill: false, dates: ["2025-02-11", "2025-02-12", "2025-02-13", "2025-02-14", "2025-02-15", "2025-02-16"] },
                { label: "No Glass", data: [...res.data[2]['graph_alert3']], borderColor: "yellow", fill: false, dates: ["2025-02-11", "2025-02-12", "2025-02-13", "2025-02-14", "2025-02-15", "2025-02-16"] },
                { label: "No Gloves", data: [...res.data[2]['graph_alert4']], borderColor: "purple", fill: false, dates: ["2025-02-11", "2025-02-12", "2025-02-13", "2025-02-14", "2025-02-15", "2025-02-16"] },
              ]
          })
          setIncidentDistributionData({
            labels: ["No Helmet", "No Vest", "No Glass", "No Gloves"],
            datasets: [
                {
                  data: [res.data[0]['score_alert1'],res.data[0]['score_alert2'],res.data[0]['score_alert3'],res.data[0]['score_alert4']],
                  backgroundColor: ["green", "red", "orange", "purple"],
                  dates: ["2025-02-12", "2025-02-13", "2025-02-14", "2025-02-15"],
                },
              ],
          })
          setSafetyScore(res.data[3]['now_entire_percent']);
          setSafetyStats(
            [
              { label: "No Helmet", value: res.data[3]['now_alert1_percent'], color: "green", date: "2025-02-12" },
              { label: "No Vest", value: res.data[3]['now_alert2_percent'], color: "red", date: "2025-02-14" },
              { label: "No Glass", value: res.data[3]['now_alert3_percent'], color: "orange", date: "2025-02-15" },
              { label: "No Gloves", value: res.data[3]['now_alert4_percent'], color: "purple", date: "2025-02-16" },
            ],
          )
        })
  }, [startDate, endDate]);

  const getHeatmapColor = (value) => {
    if (value > 3) return "#003087";
    if (value > 2) return "#005eb8";
    if (value > 1) return "#4a90e2";
    return "#d3e4fa";
  };

  return (
    <div className="summary-page">
      <div className="summary-header">
        <div className="date-picker">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
        <button className="btn">
          <i className="bi bi-download"></i> {t("download")}
        </button>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <SafetyScoreCard safetyScore={safetyScore} safetyStats={safetyStats} />
        </div>

          {/* Other Cards Column */}
        <div className="col-12 col-lg-8">
          <div className="row g-4">
            {/* Trend Analysis Chart */}
            <div className="col-12 col-md-8">
              <TrendAnalysisChart incidentTrendData={incidentTrendData} />
            </div>

            {/* Incident Distribution */}
            <div className="col-12 col-md-4">
              <IncidentDistributionChart incidentDistributionData={incidentDistributionData} />
            </div>

            {/* Heatmap */}
            <div className="col-12 col-md-8">
              <HeatmapOverview heatmapData={heatmap_week} getHeatmapColor={getHeatmapColor} />
            </div>

            {/* Violation Ranking */}
            <div className="col-12 col-md-4">
              <ViolationRanking violationRanking={violationRanking} />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Summary;