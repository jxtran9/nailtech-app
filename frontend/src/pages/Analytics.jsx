import { useEffect, useState } from "react";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [busiestDays, setBusiestDays] = useState({});
  const [peakHours, setPeakHours] = useState({});
  const [topServices, setTopServices] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

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

  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <h2>Summary</h2>
      <pre>{JSON.stringify(summary, null, 2)}</pre>

      <h2>Busiest Days</h2>
      <pre>{JSON.stringify(busiestDays, null, 2)}</pre>

      <h2>Peak Hours</h2>
      <pre>{JSON.stringify(peakHours, null, 2)}</pre>

      <h2>Top Services</h2>
      <pre>{JSON.stringify(topServices, null, 2)}</pre>

      <h2>Recommendations</h2>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}