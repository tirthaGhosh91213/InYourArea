import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { useNavigate } from "react-router-dom";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/properties/recent?days=15")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }
        return res.json();
      })
      .then((data) => {
        const allProps = data.properties || data.data || [];
        // Only show approved properties
        const approved = allProps.filter(
          (prop) =>
            prop.status === "APPROVED" || !prop.status || prop.status.toLowerCase() === "approved"
        );
        setProperties(approved);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshProperties={() => {}} />
      </div>

      {/* Left Sidebar + Content */}
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <h2 className="text-3xl font-bold text-green-700 text-center mb-10">All Properties</h2>
          {loading ? (
            <div className="flex justify-center py-12 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="flex justify-center py-12 text-red-600">{error}</div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
              {properties.length === 0 && <p>No properties found.</p>}
              {properties.map((property) => (
                <div
                  key={property._id || property.id}
                  className="bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-200"
                  style={{ minHeight: 250 }}
                >
                  {/* Left: Image Section */}
                  <div className="md:w-1/2 flex items-center justify-center bg-gray-100 min-h-[230px]">
                    {property.imageUrls && property.imageUrls.length > 0 ? (
                      <img
                        src={property.imageUrls[0]}
                        alt={property.title}
                        className="object-cover rounded-xl"
                        style={{ width: "95%", height: 210, maxWidth: 320 }}
                      />
                    ) : (
                      <div
                        className="w-full h-[210px] flex items-center justify-center bg-gray-200 rounded-xl"
                        style={{ maxWidth: 320 }}
                      >
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  {/* Property Details */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                        {property.title}
                      </h3>
                      <p className="text-blue-600 font-bold text-2xl mb-2">
                        ₹ {(Number(property.price) / 100000).toLocaleString("en-IN")} Lakhs
                      </p>
                      <div className="flex flex-wrap gap-6 mb-3 text-gray-700 font-medium">
                        <span>
                          Area: {property.totalArea} sq. ft
                        </span>
                        <span>
                          Status: {property.propertyStatus === "FOR_SALE" ? "Freehold" : property.propertyStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-6 mb-3 text-gray-700 font-medium">
                        <span>Orientation: North-Facing</span>
                        <span>Road: 30 ft. wide</span>
                      </div>
                      <div className="text-gray-600 mb-1">
                        {property.address}, {property.locality}, {property.city}, {property.state}
                      </div>
                    </div>
                    <div className="mt-5 flex gap-4">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="bg-white border-2 border-green-600 text-green-700 font-bold py-2 px-5 rounded-xl shadow hover:bg-green-50"
                        onClick={() =>
                          window.open(
                            `mailto:${property.contactEmail || ""}?subject=Property%20Enquiry%20${encodeURIComponent(property.title)}`
                          )
                        }
                      >
                        Contact Agent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <style>{`
            @media (max-width: 900px) {
              .md\\:flex-row { flex-direction: column !important;}
            }
          `}</style>
        </main>
      </div>
    </>
  );
}
