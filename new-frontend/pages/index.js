import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import API from "../lib/api"; // Updated API configuration
import Link from 'next/link';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [userType, setUserType] = useState("intern"); // Toggle for role selection
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // if user is already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = localStorage.getItem("role");
      const redirectPath = role === "admin" ? "/admin/dashboard" : "/intern/dashboard";
      router.push(redirectPath);
    }
  }, []);


  // Login Function
  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const endpoint = userType === "admin" ? "/admin/login" : "/interns/login";
      const response = await API.post(endpoint, data);
      // Save Token and User Data in Secure Cookies or Memory
      const tokenExpiration = new Date().getTime() + 3600000; // Example: 1-hour expiration
      localStorage.setItem("token", response.data?.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("role", userType);
      localStorage.setItem("tokenExpiration", tokenExpiration);

      const redirectPath =
        userType === "admin" ? "/admin/dashboard" : "/intern/dashboard";
      router.push(redirectPath);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1E2E] to-[#1E1E2E] relative overflow-hidden">
      {/* Background Wave */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-tr from-[#27293C] to-[#27293C] rounded-b-full z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-tl from-[#27293C] to-[#27293C] rounded-t-full z-0"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-blue-600">Welcome</h2>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        {/* Role Selection Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="userType"
            className="block mb-2 text-gray-600 font-medium"
            aria-label="Select user role"
          >
            Login As
          </label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="intern">Intern</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.email ? "border-red-500" : ""
              }`}
              aria-label="Enter your email"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-600 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.password ? "border-red-500" : ""
              }`}
              aria-label="Enter your password"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-center text-sm mb-4">{errorMessage}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
            aria-label="Submit login form"
          >
            {loading ? "Logging In..." : "LOG IN"}
          </button>
        </form>
        {/* Sign Up Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            <Link className="text-blue-500 hover:underline font-medium" href="/intern/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
