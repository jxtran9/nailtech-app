import { useEffect, useState } from "react";
import "../styles/services.css";

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
    <main className="services-page">
      <section className="services-header">
        <h1>Our Services</h1>
        <p>Browse our available nail and beauty services.</p>
      </section>

      {error && <p className="error-message">Error: {error}</p>}

      <section className="services-list">
        {sortedCategories.map(([category, categoryServices]) => (
          <div key={category} className="service-category">
            <button
              onClick={() => toggleCategory(category)}
              className="category-button"
            >
              {openCategories[category] ? "▼" : "►"} {category}
            </button>

            {openCategories[category] && (
              <div className="category-services">
                {categoryServices.map((service) => (
                  <div key={service.service_id} className="service-card">
                    <h3>{service.service_name}</h3>
                    <p>
                      <strong>Price:</strong> $
                      {Number(service.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

export default Services;
