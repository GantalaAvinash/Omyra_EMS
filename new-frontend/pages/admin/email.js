import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';
import API from '@/lib/api';
import { useRouter } from 'next/router';

// Predefined subjects for suggestions
const predefinedSubjects = [
  'Welcome to the Team!',
  'Project Update',
  'Training Schedule',
  'Feedback Reminder',
  'Important Announcement',
];

// Component for filtering interns by designation
const InternFilter = ({ designation, setDesignation }) => (
  <div className="mb-4">
    <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
      Filter by Designation
    </label>
    <select
      id="designation"
      className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      value={designation}
      onChange={(e) => setDesignation(e.target.value)}
    >
      <option value="">All Designations</option>
      {['Frontend', 'Backend', 'MERN', 'MEAN', 'Salesforce', 'Cloud', 'Design', 'Sale', 'Marketing'].map(
        (option) => (
          <option key={option} value={option}>
            {option}
          </option>
        )
      )}
    </select>
  </div>
);

// Component for displaying the list of interns with selection checkboxes
const InternList = ({ interns, selectedInterns, handleSelectIntern }) => (
  <ul className="list-group space-y-2 mb-4">
    {interns.length > 0 ? (
      interns.map((intern) => (
        <li
          key={intern._id}
          className="flex justify-between items-center px-4 py-2 rounded-md bg-gray-50 shadow-sm"
        >
          <span>
            {intern.firstName} {intern.lastName} ({intern.designation})
          </span>
          <input
            type="checkbox"
            aria-label={`Select ${intern.firstName} ${intern.lastName}`}
            checked={selectedInterns.includes(intern._id)}
            onChange={() => handleSelectIntern(intern._id)}
          />
        </li>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No interns found.</p>
    )}
  </ul>
);

// Component for the email form
const EmailForm = ({
  subject,
  setSubject,
  message,
  setMessage,
  predefinedSubjects,
}) => (
  <>
    <div className="mb-4">
      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
        Subject
      </label>
      <input
        type="text"
        id="subject"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
        placeholder="Enter subject or choose a suggestion"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <div className="mt-2">
        <strong>Suggestions:</strong>
        <div className="flex flex-wrap gap-2 mt-2">
          {predefinedSubjects.map((suggestion) => (
            <button
              key={suggestion}
              className="btn btn-outline-secondary btn-sm text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
              onClick={() => setSubject(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div className="mb-4">
      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
        Message
      </label>
      <textarea
        id="message"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
        rows="5"
        placeholder="Enter your message here"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>
    </div>
  </>
);

// Main Component
const SendEmail = () => {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [designation, setDesignation] = useState('');
  const [interns, setInterns] = useState([]);
  const [selectedInterns, setSelectedInterns] = useState([]);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const response = await API.get('/admin/interns');
        setInterns(response.data);
      } catch (error) {
        console.error('Error fetching interns:', error);
        toast.error('Failed to fetch interns. Please try again later.');
      }
    };

    fetchInterns();
  }, []);

  const handleSendEmail = async () => {
    if (!subject || !message || selectedInterns.length === 0) {
      toast.error('Please fill all fields and select at least one intern.');
      return;
    }

    try {
      await API.post('/admin/send-email', {
        subject,
        message,
        recipients: selectedInterns,
      });
      toast.success('Email sent successfully!');
      setSubject('');
      setMessage('');
      setSelectedInterns([]);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again later.');
    }
  };

  const handleSelectIntern = (id) => {
    setSelectedInterns((prev) =>
      prev.includes(id)
        ? prev.filter((internId) => internId !== id)
        : [...prev, id]
    );
  };

  const filteredInterns = useMemo(
    () =>
      designation
        ? interns.filter((intern) => intern.designation === designation)
        : interns,
    [interns, designation]
  );

  return (
    <Layout key={router.asPath}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-center mb-5">Send Email to Interns</h1>
        <InternFilter designation={designation} setDesignation={setDesignation} />
        <EmailForm
          subject={subject}
          setSubject={setSubject}
          message={message}
          setMessage={setMessage}
          predefinedSubjects={predefinedSubjects}
        />
        <h3 className="text-lg font-semibold mb-3">Select Interns</h3>
        <InternList
          interns={filteredInterns}
          selectedInterns={selectedInterns}
          handleSelectIntern={handleSelectIntern}
        />
        <button
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleSendEmail}
        >
          Send Email
        </button>
      </div>
    </Layout>
  );
};

export default SendEmail;
