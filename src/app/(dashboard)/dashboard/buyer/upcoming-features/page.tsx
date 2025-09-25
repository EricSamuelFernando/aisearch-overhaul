"use client";

import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { FaCalendarPlus, FaComments, FaTasks } from "react-icons/fa";

const features = [
  {
    title: "Create Tour",
    description:
      "Buyers can schedule property tours. Once created, notifications are sent instantly to both Seller and Agent.",
    icon: <FaCalendarPlus size={36} className="text-blue-600" />,
  },
  {
    title: "Conversations",
    description:
      "Seamless communication between Buyer, Seller, and Agent within the platform. Share updates, confirm timings, and resolve queries.",
    icon: <FaComments size={36} className="text-green-600" />,
  },
  {
    title: "Messages",
    description:
      "Seamless communication and Share updates, confirm timings, and resolve queries.",
    icon: <FaComments size={36} className="text-green-600" />,
  },
  {
    title: "Tasks",
    description:
      "Keep track of important tasks related to your property tours. Assign, manage, and complete tasks with ease.",
    icon: <FaTasks size={36} className="text-purple-600" />,
  },
];

const UpcomingFeaturesPage = () => {
  return (
    <div className="px-8 py-12">
      {/* Back button */}
      <div className="mb-6 flex items-center">
        <Link
          href="/dashboard/buyer"
          className="flex items-center font-medium text-black"
        >
          <FiArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </Link>
      </div>

      {/* Page heading */}
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-4">
        🚀 Upcoming Features
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Exciting features are on the way to make your property tour experience
        smoother and more productive.
      </p>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition p-6 flex flex-col items-center text-center bg-white"
          >
            <div className="mb-4">{feature.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h2>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingFeaturesPage;
