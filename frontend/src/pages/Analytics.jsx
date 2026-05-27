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
import { Link } from "react-router-dom";
import API_BASE from "../api";
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
  const [serviceCategories, setServiceCategories] = useState({});
  const [topServices, setTopServices] = useState({});
  const [topWorkers, setTopWorkers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [repeatCustomers, setRepeatCustomers] = useState(0);
  const [selectedDays, setSelectedDays] = useState("");

  // Fetch analytics data when the dashboard page first loads
  useEffect(() => {
    fetchAnalytics();
  }, [selectedDays]);

  // Retrieves analytics data from FastAPI backend endpoints
  const fetchAnalytics = async () => {
    const daysQuery = selectedDays ? `?days=${selectedDays}` : "";

    const summaryRes = await fetch(`${API_BASE}/analytics/summary${daysQuery}`);
    const summaryData = await summaryRes.json();
    setSummary(summaryData);

    const daysRes = await fetch(
      `${API_BASE}/analytics/busiest-days${daysQuery}`
    );
    const daysData = await daysRes.json();
    setBusiestDays(daysData);

    const hoursRes = await fetch(
      `${API_BASE}/analytics/peak-hours${daysQuery}`
    );
    const hoursData = await hoursRes.json();
    setPeakHours(hoursData);

    const categoriesRes = await fetch(
      `${API_BASE}/analytics/service-categories${daysQuery}`
    );
    const categoriesData = await categoriesRes.json();
    setServiceCategories(categoriesData);

    const servicesRes = await fetch(
      `${API_BASE}/analytics/top-services${daysQuery}`
    );
    const servicesData = await servicesRes.json();
    setTopServices(servicesData);

    const workersRes = await fetch(
      `${API_BASE}/analytics/top-workers${daysQuery}`
    );
    const workersData = await workersRes.json();
    setTopWorkers(workersData);

    const recRes = await fetch(
      `${API_BASE}/analytics/recommendations${daysQuery}`
    );
    const recData = await recRes.json();
    setRecommendations(recData.recommendations);

    const repeatRes = await fetch(
      `${API_BASE}/analytics/repeat-customers${daysQuery}`
    );
    const repeatData = await repeatRes.json();
    setRepeatCustomers(repeatData);
  };

  // Chart data for completed appointments grouped by day of week
  const busiestDaysChartData = {
    labels: Object.keys(busiestDays),
    datasets: [
      {
        label: "Completed Appointments",
        data: Object.values(busiestDays),
        backgroundColor: "#e88bb5",
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
        backgroundColor: "#e88bb5",
      },
    ],
  };

  // Chart data for most requested completed service categories
  const serviceCategoriesChartData = {
    labels: Object.keys(serviceCategories),
    datasets: [
      {
        label: "Completed Services",
        data: Object.values(serviceCategories),
        backgroundColor: [
          "#e88bb5",
          "#f4b6c2",
          "#d8c3f0",
          "#b8d8f8",
          "#f7d6a3",
        ],
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
          "#e88bb5",
          "#f4b6c2",
          "#d8c3f0",
          "#b8d8f8",
          "#f7d6a3",
        ],
      },
    ],
  };

  // Chart data for most requested completed workers/technicians
  const topWorkersChartData = {
    labels: Object.keys(topWorkers),
    datasets: [
      {
        label: "Completed Appointments",
        data: Object.values(topWorkers),
        backgroundColor: "#e88bb5",
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

        <div className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/add-booking">Add Booking</Link>
          <Link to="/admin/analytics">Analytics</Link>
        </div>

        <section className="analytics-filter">
          <label htmlFor="days-filter">Date Range: </label>
          <select
            id="days-filter"
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
          >
            <option value="">All Time</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
        </section>

        <h2>Summary</h2>
        {summary && (
          <section className="analytics-summary-grid">
            <section className="analytics-summary-card">
              <h3>Total Appointments</h3>
              <p>{summary.total_appointments}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Completed</h3>
              <p>{summary.completed}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Completed Revenue</h3>
              <p>${summary.completed_revenue}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Repeat Customers</h3>
              <p>{repeatCustomers.repeat_customers}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Repeat Rate</h3>
              <p>{repeatCustomers.repeat_rate}%</p>
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
              <h3>Cancelled</h3>
              <p>{summary.cancelled}</p>
            </section>

            <section className="analytics-summary-card">
              <h3>Declined</h3>
              <p>{summary.declined}</p>
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
          <h2>Service Categories</h2>
          <section className="analytics-pie-box">
            <Pie data={serviceCategoriesChartData} options={pieChartOptions} />
          </section>
        </section>

        <section className="analytics-chart-card">
          <h2>Top Services</h2>
          <section className="analytics-pie-box">
            <Pie data={topServicesChartData} options={pieChartOptions} />
          </section>
        </section>

        <section className="analytics-chart-card">
          <h2>Top Requested Workers</h2>
          <section className="analytics-chart-box">
            <Bar data={topWorkersChartData} options={barChartOptions} />
          </section>
        </section>

        <h2>Recommendations</h2>

        <section className="analytics-recommendation-grid">
          {recommendations.map((rec, index) => (
            <section key={index} className="analytics-recommendation-card">
              <strong>
                {
                  [
                    "Peak Scheduling",
                    "Peak Apppointment Hours",
                    "Low Demand Periods",
                    "Popular Service Demand",
                    "Customer Retention",
                  ][index]
                }
              </strong>
              <p>{rec}</p>
            </section>
          ))}
        </section>
      </section>
    </main>
  );
}
