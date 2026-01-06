import React from 'react';
import { Truck, Lock, RefreshCcw, Headphones } from "lucide-react";

export const FeatureSection = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="border-t border-b border-red-600 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 bg-opacity-10 rounded-full p-3">
            <Truck className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Free Shipping</h3>
            <p className="text-sm text-gray-600">Free shipping on all US order or order above $100</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-red-600 bg-opacity-10 rounded-full p-3">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Security Payment</h3>
            <p className="text-sm text-gray-600">Simply return it within 30 days for an exchange.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-red-600 bg-opacity-10 rounded-full p-3">
            <RefreshCcw className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">14-Day Return</h3>
            <p className="text-sm text-gray-600">Simply return it within 30 days for an exchange.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-red-600 bg-opacity-10 rounded-full p-3">
            <Headphones className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">24/7 Support</h3>
            <p className="text-sm text-gray-600">Contact us 24 hours a day, 7 day's week</p>
          </div>
        </div>
      </div>
    </section>
  );
}