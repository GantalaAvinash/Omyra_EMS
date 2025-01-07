import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { fetchInterns, deleteIntern, createIntern, updateIntern } from "../../lib/api";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Interns = () => {
  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    passportNumber: "",
    designation: "",
    currentAddress: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // Fetch interns
  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      const { data } = await fetchInterns();
      if (Array.isArray(data)) {
        setInterns(data);
        setFilteredInterns(data);
      } else {
        console.error("Invalid data received from API");
      }
    } catch (error) {
      console.error("Error fetching interns:", error);
    }
  };

  // View Detailed Intern Information
  const handleViewDetails = (employee) => {
    setCurrentEmployee(employee);
    setShowDetailsModal(true);
  };

  // Search filter logic
  useEffect(() => {
    const results = interns.filter((emp) =>
      Object.values(emp).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredInterns(results);
  }, [searchTerm, interns]);

  // Open Modal
  const handleOpenModal = (employee = null) => {
    setCurrentEmployee(employee);
    setFormData(employee || initialFormData);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEmployee(null);
    setFormData(initialFormData);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEmployee) {
        await updateIntern(currentEmployee._id, formData);
        toast.success("Intern updated successfully");
      } else {
        await createIntern(formData);
        toast.success("Intern added successfully");
      }
      handleCloseModal();
      loadInterns();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    }
  };

  // Delete Intern
  const handleDelete = async (id) => {
    try {
      if (confirm("Are you sure you want to delete this employee?")) {
        await deleteIntern(id);
        loadInterns();
        toast.success("Intern deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };
  const exportToPDF = (employee) => {
    const doc = new jsPDF();
  
    // Add a header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Intern Details", 105, 20, { align: "center" });
  
    // Personal Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Personal Information", 14, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const personalInfo = [
      ["Name", `${employee.firstName} ${employee.lastName}`],
      ["Email", employee.email],
      ["Phone", employee.phone],
      ["Date of Birth", new Date(employee.dob).toLocaleDateString()],
      ["Nationality", employee.nationality],
      ["Intern ID", employee.internId],
      ["Designation", employee.designation],
      ["Current Address", employee.currentAddress],
      ["Role", employee.role],
    ];
    doc.autoTable({
      head: [["Field", "Details"]],
      body: personalInfo,
      startY: 50,
    });
  
    // Education Section
    const educationStartY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Education", 14, educationStartY);
    doc.setFont("helvetica", "normal");
    const educationData = employee.education.map((edu) => [
      edu.degree,
      edu.duration,
      edu.institute,
      edu.grade,
    ]);
    doc.autoTable({
      head: [["Degree", "Duration", "Institute", "Grade"]],
      body: educationData,
      startY: educationStartY + 10,
    });
  
    // Experience Section
    const experienceStartY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Experience", 14, experienceStartY);
    doc.setFont("helvetica", "normal");
    const experienceData = employee.experience.map((exp) => [
      exp.company,
      exp.duration,
      exp.role,
    ]);
    doc.autoTable({
      head: [["Company", "Duration", "Role"]],
      body: experienceData,
      startY: experienceStartY + 10,
    });
  
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Generated with jsPDF", 105, 290, { align: "center" });
  
    // Save the PDF
    doc.save(`${employee.firstName}_${employee.lastName}_Resume.pdf`);
  };
  
  

  return (
    <Layout>
      <div className="p-6 bg-[#13192F] min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Intern Management</h1>
        </div>

        {/* Search Input */}
        <div className="flex mb-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search interns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border rounded"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* Intern Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">First Name</th>
                <th className="p-2 text-left">Last Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Designation</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterns.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50">
                  <td className="p-2">{emp.firstName}</td>
                  <td className="p-2">{emp.lastName}</td>
                  <td className="p-2">{emp.email}</td>
                  <td className="p-2">{emp.designation}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(emp)}
                      className="text-green-500 hover:underline"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-red-500 hover:underline"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => exportToPDF(emp)}
                      className="text-blue-500 hover:underline"
                    >
                      <FaFilePdf />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Intern View Modal */}
        {showDetailsModal && currentEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Intern Details</h2>
              <ul className="space-y-4">
                {Object.entries(currentEmployee).map(([key, value]) => (
                  <li key={key} className="text-gray-700">
                    <strong className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:{" "}
                    </strong>
                    {typeof value === "object" && value !== null ? (
                      Array.isArray(value) ? (
                        <ul className="ml-6 list-disc">
                          {value.map((item, index) => (
                            <li key={index} className="text-gray-600">
                              {typeof item === "object" ? (
                                <ul className="ml-4">
                                  {Object.entries(item).map(([subKey, subValue]) => (
                                    <li key={subKey}>
                                      <strong className="capitalize">
                                        {subKey.replace(/([A-Z])/g, " $1")}:{" "}
                                      </strong>
                                      {subValue ?? "N/A"}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                item ?? "N/A"
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="ml-4 list-none">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <li key={subKey}>
                              <strong className="capitalize">
                                {subKey.replace(/([A-Z])/g, " $1")}:{" "}
                              </strong>
                              {subValue ?? "N/A"}
                            </li>
                          ))}
                        </ul>
                      )
                    ) : (
                      value ?? "N/A"
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}



      </div>
    </Layout>
  );
};

export default Interns;
