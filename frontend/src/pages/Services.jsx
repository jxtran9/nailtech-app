import { useEffect, useState } from "react";

const categoryOrder = [
  "Manicure",
  "Pedicure",
  "Nails Enhancements",
  "Waxing",
  "Additional Services",
];

function Services() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("http://127.0.0.1:8000/services");
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        setServices(data);

        const initialOpenCategories = data.reduce((acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = true;
          }
          return acc;
        }, {});

        setOpenCategories(initialOpenCategories);
      } catch (err) {
        setError(String(err));
      }
    }

    loadServices();
  }, []);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  Object.keys(groupedServices).forEach((category) => {
    groupedServices[category].sort((a, b) =>
      a.service_name.localeCompare(b.service_name)
    );
  });

  const sortedCategories = Object.entries(groupedServices).sort(
    ([categoryA], [categoryB]) =>
      categoryOrder.indexOf(categoryA) - categoryOrder.indexOf(categoryB)
  );

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#f9f6f2",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "10px",
          color: "#333",
        }}
      >
        Our Services
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginBottom: "30px",
        }}
      >
        Browse our available nail and beauty services
      </p>

      <p
        style={{
          marginBottom: "20px",
          fontWeight: "bold",
          color: "#444",
        }}
      >
        Total services: {services.length}
      </p>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {sortedCategories.map(([category, categoryServices]) => (
        <div
          key={category}
          style={{
            marginBottom: "20px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            backgroundColor: "white",
          }}
        >
          <button
            onClick={() => toggleCategory(category)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "16px 20px",
              fontSize: "18px",
              fontWeight: "bold",
              border: "none",
              backgroundColor: "#d8b4a0",
              color: "white",
              cursor: "pointer",
            }}
          >
            {openCategories[category] ? "▼" : "►"} {category}
          </button>

          {openCategories[category] && (
            <div style={{ padding: "16px" }}>
              {categoryServices.map((service) => (
                <div
                  key={service.service_id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "14px",
                    marginBottom: "12px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                    {service.service_name}
                  </h3>

                  <p style={{ margin: "4px 0", color: "#555" }}>
                    <strong>Price:</strong> $
                    {Number(service.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Services;