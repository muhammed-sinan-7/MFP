import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "../validation/onboardingSchema";
import { createOrganization, getIndustries } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  BuildingOfficeIcon,
  BriefcaseIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { BRAND_LOGO, BRAND_NAME } from "../config/brand";

export default function Onboarding() {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await getIndustries();
        setIndustries(response.data);
      } catch (error) {
        console.error("Failed to fetch industries", error);
      } finally {
        setLoadingIndustries(false);
      }
    };
    fetchIndustries();
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await createOrganization(data);
      const orgId = response.data.id;
      localStorage.setItem("orgId", orgId);
      navigate("/dashboard");
    } catch {
      toast.error("Organization creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-8 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <img src={BRAND_LOGO} alt={BRAND_NAME} className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-gray-800">
            {BRAND_NAME}
          </span>
        </div>

        <div className="text-sm text-gray-500">Support</div>
      </div>

      {/* Center Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-200 p-10">

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-6 mb-8 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                1
              </div>
              ORGANIZATION
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Tell us about your organization
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            This information will be used to customize your platform experience.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Acme Corporation"
                  {...register("name")}
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <div className="relative">
                <BriefcaseIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  {...register("industry")}
                  disabled={loadingIndustries}
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                >
                  <option value="" disabled>
                    {loadingIndustries
                      ? "Loading industries..."
                      : "Select an industry"}
                  </option>
                  {industries.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.industry && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Trust Bar */}
      <div className="py-6 text-center text-xs text-gray-500 border-t bg-white">
        <div className="flex justify-center gap-10">
          <span>SOC2 Compliant</span>
          <span>256-bit Encryption</span>
          <span>99.9% Uptime SLA</span>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
        {`© 2026 ${BRAND_NAME}. All rights reserved.`}
      </footer>
    </div>
  );
}
