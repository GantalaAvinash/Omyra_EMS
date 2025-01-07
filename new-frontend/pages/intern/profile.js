import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { fetchIntern, updateInternProfile } from "../../lib/api";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    nationality: "",
    internId: "",
    designation: "",
    currentAddress: "",
    education: [],
    experience: [],
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const intern = JSON.parse(localStorage.getItem("user"))?.intern;
      const internId = intern?._id;
      if (!internId) {
        console.error("Intern ID not found");
      }
      

      const { data } = await fetchIntern(internId);

      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
        nationality: data.nationality || "",
        internId: data.internId || "",
        designation: data.designation || "",
        currentAddress: data.currentAddress || "",
        education: data.education || [],
        experience: data.experience || [],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const intern = JSON.parse(localStorage.getItem("user"))?.intern;
      const internId = intern?._id;
      if (!internId) {
        console.error("Intern ID not found");
      }

      const updatedData = { ...formData };
      delete updatedData.internId; // Ensure internId is not editable
      await updateInternProfile(internId, updatedData);

      alert("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleEducationChange = (e, index) => {
    const newEducation = [...formData.education];
    newEducation[index][e.target.name] = e.target.value;
    setFormData({ ...formData, education: newEducation });
  };

  const handleExperienceChange = (e, index) => {
    const newExperience = [...formData.experience];
    newExperience[index][e.target.name] = e.target.value;
    setFormData({ ...formData, experience: newExperience });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: "", duration: "", institute: "", grade: "" }],
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: "", duration: "", role: "" }],
    });
  };

  return (
    <Layout>
      <div className="p-6 bg-[#13192F] min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Profile</h1>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto rounded-lg shadow-md space-y-8">
          <section className="p-8 border-double border-4 bg-white border-black-500 ... rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 mt-4 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName.toUpperCase()}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName.toUpperCase()}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
            <input
              type="text"
              placeholder="Passport Number"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
            <input
              type="text"
              placeholder="Intern ID"
              value={formData.internId}
              className="p-3 border rounded-lg bg-gray-200 cursor-not-allowed"
              disabled
            />
            <input
              type="text"
              placeholder="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!isEditing}
            />
          </div>
          </section>
          <section className="p-8 border-double border-4 bg-white border-black-500 ... rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 mt-4 mb-4">Educational Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
          {/* Education Section */}
          <div className="space-y-4">
            {formData.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="degree"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
                <input
                  type="text"
                  name="institute"
                  placeholder="Institute"
                  value={edu.institute}
                  onChange={(e) => handleEducationChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
                <input
                  type="text"
                  name="duration"
                  placeholder="Duration"
                  value={edu.duration}
                  onChange={(e) => handleEducationChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
                <input
                  type="text"
                  name="grade"
                  placeholder="Grade"
                  value={edu.grade}
                  onChange={(e) => handleEducationChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
              </div>
            ))}
            {isEditing && (
              <button
                type="button"
                onClick={addEducation}
                className="bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
              >
                Add Education
              </button>
            )}
          </div>
          </section>

          {/* Experience Section */}
          <section className="p-8 border-double border-4 bg-white border-black-500 ... rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 mt-4 mb-4">Experience Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
                <input
                  type="text"
                  name="role"
                  placeholder="Role"
                  value={exp.role}
                  onChange={(e) => handleExperienceChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
                <input
                  type="text"
                  name="duration"
                  placeholder="Duration"
                  value={exp.duration}
                  onChange={(e) => handleExperienceChange(e, index)}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditing}
                />
              </div>
            ))}
            {isEditing && (
              <button
                type="button"
                onClick={addExperience}
                className="bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
              >
                Add Experience
              </button>
            )}
          </div>
          </section>

            <section className="p-8 border-double border-4 bg-white border-black-500 ... rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 mt-4 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

          {/* Current Address */}
          <textarea
            placeholder="Current Address"
            value={formData.currentAddress}
            onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!isEditing}
          ></textarea>
          </section>

          <div className="flex justify-between mt-6">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile(); // Reset changes
                  }}
                  className="bg-gray-400 text-white py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 px-4 rounded-md"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
