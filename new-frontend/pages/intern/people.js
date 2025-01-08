/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { fetchInterns } from "../../lib/api";
import Layout from "@/components/Layout";

const PeoplePage = () => {
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      const { data } = await fetchInterns();
      setInterns(data);
    } catch (error) {
      console.error("Failed to fetch interns:", error);
    }
  };

  const filteredInterns = interns.filter((intern) =>
    `${intern.firstName} ${intern.lastName} ${intern.internId}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
    <div className="p-6 ">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[70vh]">
        {/* Left Sidebar */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
          <h2 className="text-lg font-bold mb-4">People</h2>
          <input
            type="text"
            placeholder="Enter Emp. Name or ID"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="overflow-y-auto max-h-[500px]">
            {filteredInterns.map((intern) => (
              <div
                key={intern.internId}
                className={`flex items-center gap-2 p-2 cursor-pointer ${
                  selectedIntern?.internId === intern.internId
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedIntern(intern)}
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0">
                  {intern.profilePicture ? (
                    <img
                      src={intern.profilePicture}
                      alt={`${intern.firstName} ${intern.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                      {intern.firstName[0].toUpperCase()}
                      {intern.lastName[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {intern.firstName} {intern.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{`#${intern.internId}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {selectedIntern ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header Section */}
            <div className="flex items-center gap-6 border-b pb-4 mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md bg-gray-200">
                {selectedIntern.profilePicture ? (
                  <img
                    src={selectedIntern.profilePicture}
                    alt={`${selectedIntern.firstName} ${selectedIntern.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-[50px] font-bold">
                    {selectedIntern.firstName[0].toUpperCase()}{selectedIntern.lastName[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{`${selectedIntern.firstName} ${selectedIntern.lastName}`}</h2>
                <p className="text-sm text-gray-500">{`#${selectedIntern.internId}`}</p>
                <span className="inline-block bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full mt-2">
                  {selectedIntern.designation}
                </span>
              </div>
            </div>
          
            {/* Contact Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26c.43.29.97.29 1.4 0L21 8M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10"
                  />
                </svg>
                Contact Details
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedIntern.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Phone:</strong> {selectedIntern.phone}
              </p>
            </div>
          
            {/* Other Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 01-8 0 4 4 0 018 0zM12 14c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z"
                  />
                </svg>
                Other Information
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {selectedIntern.currentAddress}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date of Joining:</strong>{" "}
                {new Date(selectedIntern.dateOfJoining).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date of Birth:</strong>{" "}
                {new Date(selectedIntern.dob).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            </div>
          </div>
          
          ) : (
            <p className="text-center text-gray-500">
              Select an intern to view their details.
            </p>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default PeoplePage;
