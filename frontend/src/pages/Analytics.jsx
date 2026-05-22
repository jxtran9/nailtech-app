import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import { useEffect, useState } from "react";
import "../styles/analytics.css";

// Register Chart.js components used for bar and pie charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [busiestDays, setBusiestDays] = useState({});
  const [peakHours, setPeakHours] = useState({});
  const [topServices, setTopServices] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  // Fetch analytics data when the dashboard page first loads
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Retrieves analytics data from FastAPI backend endpoints
  const fetchAnalytics = async () => {
    const summaryRes = await fetch("http://127.0.0.1:8000/analytics/summary");
    const summaryData = await summaryRes.json();
    setSummary(summaryData);

    const daysRes = await fetch("http://127.0.0.1:8000/analytics/busiest-days");
    const daysData = await daysRes.json();
    setBusiestDays(daysData);

    const hoursRes = await fetch("http://127.0.0.1:8000/analytics/peak-hours");
    const hoursData = await hoursRes.json();
    setPeakHours(hoursData);

    const servicesRes = await fetch(
      "http://127.0.0.1:8000/analytics/top-services"
    );
    const servicesData = await servicesRes.json();
    setTopServices(servicesData);

    const recRes = await fetch(
      "http://127.0.0.1:8000/analytics/recommendations"
    );
    const recData = await recRes.json();
    setRecommendations(recData.recommendations);
  };

  // Chart data for completed appointments grouped by day of week
  const busiestDaysChartData = {
    labels: Object.keys(busiestDays),
    datasets: [
      {
        label: "Completed Appointments",
        data: Object.values(busiestDays),
        backgroundColor: "#b57b5b",
      },
    ],
  };

  // Chart data for completed appointments grouped by hour
  const peakHoursChartData = {
    labels: Object.keys(peakHours),
    datasets: [
      {
        label: "Completed Appointments",
        data: Object.values(peakHours),
        backgroundColor: "#8aa6a3",
      },
    ],
  };

  // Chart data for most requested completed services
  const topServicesChartData = {
    labels: Object.keys(topServices),
    datasets: [
      {
        label: "Completed Services",
        data: Object.values(topServices),
        backgroundColor: [
          "#b57b5b",
          "#8aa6a3",
          "#d8b08c",
          "#c97c7c",
          "#9b8fb3",
        ],
      },
    ],
  };

  // Shared display settings for bar charts
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // Display settings for pie chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // Renders analytics dashboard UI with summary cards, charts, and recommendations
  return (
    <main className="analytics-page">
      <section className="analytics-card">
        <h1>Analytics Dashboard</h1>

        <h2>Summary</h2>
        {summary && (
          <section className="analytics-summary-grid">
            <section className="analytics-summary-card">
              <h3>Total Appointments</h3>
              <p>{summary.total_appointments}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Pending</h3>
              <p>{summary.pending}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Approved</h3>
              <p>{summary.approved}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Declined</h3>
              <p>{summary.declined}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Cancelled</h3>
              <p>{summary.cancelled}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Completed</h3>
              <p>{summary.completed}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Completed Revenue</h3>
              <p>${summary.completed_revenue}</p>
            </section>
          </section>
        )}

        <section className="analytics-chart-card">
          <h2>Busiest Days</h2>
          <section className="analytics-chart-box">
            <Bar data={busiestDaysChartData} options={barChartOptions} />
          </section>
        </section>

        <section className="analytics-chart-card">
          <h2>Peak Hours</h2>
          <section className="analytics-chart-box">
            <Bar data={peakHoursChartData} options={barChartOptions} />
          </section>
        </section>

        <section className="analytics-chart-card">
          <h2>Top Services</h2>
          <section className="analytics-pie-box">
            <Pie data={topServicesChartData} options={pieChartOptions} />
          </section>
        </section>

        <h2>Recommendations</h2>

        <section className="analytics-recommendation-grid">
          {recommendations.map((rec, index) => (
            <section key={index} className="analytics-recommendation-card">
              <strong>Recommendation {index + 1}</strong>
              <p>{rec}</p>
            </section>
          ))}
        </section>
      </section>
    </main>
  );
}
