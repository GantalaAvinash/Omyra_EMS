import React, { useState } from "react";
import { useRouter } from "next/router";
import { registerIntern } from "../../lib/api"; // API function to create intern

const InternRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    nationality: "",
    designation: "",
    currentAddress: "",
    education: [{ degree: "", duration: "", institute: "", grade: "" }],
    experience: [{ company: "", duration: "", role: "" }],
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (index, type, field, value) => {
    setFormData((prev) => {
      const updatedArray = [...prev[type]];
      updatedArray[index][field] = value;
      return { ...prev, [type]: updatedArray };
    });
  };

  const addField = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { degree: "", duration: "", institute: "", grade: "", company: "", role: "" }],
    }));
  };

  const removeField = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await registerIntern(formData);
      const { internId, firstName, plainPassword } = response.data.intern;
      setModalContent({
        title: "Intern Registered Successfully!",
        message: (
          <div>
            <p><strong>Name:</strong> {firstName}</p>
            <p><strong>Intern ID:</strong> {internId}</p>
            <p><strong>Password:</strong> {plainPassword}</p>
          </div>
        ),
      });
      setShowModal(true);
      router.push("/");
    } catch (error) {
      setModalContent({
        title: "Registration Failed",
        message: (
          <p>{error.response?.data?.message || "An error occurred. Please try again."}</p>
        ),
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="bg-white p-8 m-12 rounded-xl shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-extrabold text-blue-600 text-center mb-6">Intern Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input p-4" type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
            <input className="input p-4" type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
            <input className="input p-4" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <input className="input p-4" type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
            <input className="input p-4" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            <input className="input p-4" type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nationality" required />
            <select
              className="input p-4"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Designation</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="MERN">MERN</option>
              <option value="MEAN">MEAN</option>
              <option value="Salesforce">Salesforce</option>
              <option value="Cloud">Cloud</option>
              <option value="Design">Design</option>
              <option value="Sale">Sale</option>
              <option value="Marketing">Marketing</option>
            </select>

            <input className="input p-4" type="text" name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Current Address" required />
          </div>

          <FieldSection
            title="Education Details"
            data={formData.education}
            handleNestedChange={handleNestedChange}
            addField={() => addField("education")}
            removeField={(index) => removeField("education", index)}
            fields={["Degree", "Duration", "Institute", "Grade"]}
            type="education"
          />

          <FieldSection
            title="Experience Details"
            data={formData.experience}
            handleNestedChange={handleNestedChange}
            addField={() => addField("experience")}
            removeField={(index) => removeField("experience", index)}
            fields={["Company", "Duration", "Role"]}
            type="experience"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {showModal && (
          <Modal
            title={modalContent.title}
            message={modalContent.message}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

const FieldSection = ({ title, data, handleNestedChange, addField, removeField, fields, type }) => (
  <div>
    {data.map((item, index) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {fields.map((field, i) => (
          <input
            key={i}
            className="input "
            type="text"
            placeholder={field}
            value={item[field.toLowerCase()] || ""}
            onChange={(e) => handleNestedChange(index, type, field.toLowerCase(), e.target.value)}
          />
        ))}
        <button
          type="button"
          onClick={() => removeField(index)}
          className="text-white w-[100px] rounded-lg p-2 bg-red-500 hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 ..."
        >
          Remove
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={addField}
      className="text-white w-[150px] rounded-lg p-2 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 ..."
    >
      Add {title.split(" ")[0]}
    </button>
  </div>
);

const Modal = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {message}
      <button
        onClick={onClose}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
      >
        Close
      </button>
    </div>
  </div>
);

export default InternRegistration;
