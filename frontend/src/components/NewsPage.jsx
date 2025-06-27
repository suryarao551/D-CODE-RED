const Newspage = () => {
    const newsCategories = [
    { name: "Local News", color: "#F3F4F6", textColor: "#1F2937"},
    { name: "Politics", color: "#D1D5DB", textColor: "#1F2937" },
    { name: "Movies", color: "#F3F4F6", textColor: "#1F2937" },
    { name: "National News", color: "#9CA3AF", textColor: "#1F2937" },
    { name: "Science", color: "#F8C4C4", textColor: "#1F2937" },
    { name: "Classifieds", color: "#D1D5DB", textColor: "#1F2937" },
    { name: "International News", color: "#F3F4F6", textColor: "#1F2937" },
    { name: "Sports", color: "#D1D5DB", textColor: "#1F2937" },
    { name: "Art & Culture", color: "#F3F4F6", textColor: "#1F2937" },
  ];
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        {/* Page Title */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "400",
            color: "#1F2937",
            marginBottom: "3rem",
            fontFamily: "serif",
          }}
        >
          Latest News
        </h1>

        {/* News Categories Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            maxWidth: "900px",
          }}
        >
          {newsCategories.map((category, index) => (
            <button
              key={index}
              style={{
                backgroundColor: category.color,
                color: category.textColor,
                border: "none",
                borderRadius: "1rem",
                padding: "2rem 1.5rem",
                fontSize: "1.25rem",
                fontWeight: "400",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                fontFamily: "serif",
                textAlign: "center",
                minHeight: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
              onClick={() => {
                console.log(`Clicked on ${category.name}`);
                // Here you would navigate to the specific news category
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Additional Content Section */}
        <div
          style={{
            marginTop: "4rem",
            padding: "2rem",
            backgroundColor: "#F9FAFB",
            borderRadius: "0.5rem",
            border: "1px solid #E5E7EB",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: "1rem",
            }}
          >
            Stay Informed with Verified News
          </h2>
          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
              fontSize: "1rem",
            }}
          >
            Browse through our categorized news sections to find the latest
            updates across different topics. All news sources are verified and
            fact-checked to ensure accuracy and reliability. Click on any
            category above to explore the latest articles and reports.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Newspage;
