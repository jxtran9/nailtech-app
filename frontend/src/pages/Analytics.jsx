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

        const servicesRes = await fetch("http://127.0.0.1:8000/analytics/top-services");
        const servicesData = await servicesRes.json();
        setTopServices(servicesData);

        const recRes = await fetch("http://127.0.0.1:8000/analytics/recommendations");
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

    // Chart data for completed appoinments grouped by hour
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
        <div style={styles.page}>
            <div style={styles.card}>
                <h1>Analytics Dashboard</h1>

                <h2>Summary</h2>
                {summary && (
                    <div style={styles.summaryGrid}>
                        <div style={styles.summaryCard}>
                            <h3>Total Appointments</h3>
                            <p>{summary.total_appointments}</p>
                        </div>

                        <div style={styles.summaryCard}>
                            <h3>Pending</h3>
                            <p>{summary.pending}</p>
                        </div>

                        <div style={styles.summaryCard}>
                            <h3>Approved</h3>
                            <p>{summary.approved}</p>
                        </div>

                        <div style={styles.summaryCard}>
                            <h3>Declined</h3>
                            <p>{summary.declined}</p>
                        </div>

                        <div style={styles.summaryCard}>
                            <h3>Cancelled</h3>
                            <p>{summary.cancelled}</p>
                        </div>

                        <div style={styles.summaryCard}>
                            <h3>Completed</h3>
                            <p>{summary.completed}</p>
                        </div>

                        <div style={styles.summaryCard}>
                            <h3>Completed Revenue</h3>
                            <p>${summary.completed_revenue}</p>
                        </div>
                    </div>
                )}

                <div style={styles.chartCard}>
                    <h2>Busiest Days</h2>
                    <div style={styles.chartBox}>
                        <Bar data={busiestDaysChartData} options={barChartOptions} />
                    </div>
                </div>

                <div style={styles.chartCard}>
                    <h2>Peak Hours</h2>
                    <div style={styles.chartBox}>
                        <Bar data={peakHoursChartData} options={barChartOptions} />
                    </div>
                </div>

                <div style={styles.chartCard}>
                    <h2>Top Services</h2>
                    <div style={styles.pieBox}>
                        <Pie data={topServicesChartData} options={pieChartOptions} />
                    </div>
                </div>

                <h2>Recommendations</h2>

                <div style={styles.recommendationGrid}>
                    {recommendations.map((rec, index) => (
                        <div key={index} style={styles.recommendationCard}>
                            <strong>Recommendation {index + 1}</strong>
                            <p>{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Inline styles used for dashboard layout and card styling
const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f8f5f2",
        padding: "2rem",
    },

    card: {
        maxWidth: "1100px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },

    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
    },

    summaryCard: {
        backgroundColor: "#f8f5f2",
        padding: "1rem",
        borderRadius: "12px",
        border: "1px solid #e8ded8",
    },

    chartCard: {
        backgroundColor: "#fff",
        border: "1px solid #eee",
        borderRadius: "14px",
        padding: "1.25rem",
        marginBottom: "2rem",
    },

    chartBox: {
        height: "320px",
    },

    pieBox: {
        height: "300px",
        maxWidth: "420px",
        margin: "0 auto",
    },

    recommendationGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "1rem",
        marginTop: "1rem",
    },

    recommendationCard: {
        backgroundColor: "#fff8e8",
        padding: "1rem",
        borderRadius: "12px",
        border: "1px solid #f1dfb8",
    },
};