import { useState, useEffect } from 'react';
import Select from "react-select";

const mandiData = [
  { name: 'Vazhappadi', distance: 26 },
  { name: 'Namagiripettai', distance: 54 },
  { name: 'Salem', distance: 64 },
  { name: 'Omalur', distance: 76 },
  { name: 'Konganapuram', distance: 89 },
  { name: 'Mecheri', distance: 92 },
  { name: 'Boothapadi', distance: 121 },
  { name: 'Aval Poondurai', distance: 132 },
  { name: 'Elumathur', distance: 135 },
  { name: 'Kodumudi', distance: 143 },
  { name: 'Kangeyam', distance: 165 },
  { name: 'Sathyamangalam', distance: 173 },
  { name: 'Annur', distance: 198 }
];

// Same custom styles as PricePage/ComparisonPage
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    padding: "4px",
    minHeight: "44px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(16, 163, 74, 0.1)" : "0 1px 3px 0 rgba(0, 0,0,0.1)",
    "&:hover": { borderColor: "#10b981" },
    backgroundColor: "white"
  }),
  option: (provided, state) => ({
    ...provided,
    padding: "12px",
    fontSize: "14px",
    backgroundColor: state.isSelected ? "#10b981" : state.isFocused ? "#f0fdf4" : "white",
    color: state.isSelected ? "white" : "#374151",
    "&:hover": { backgroundColor: "#10b981", color: "white" }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    boxShadow: "0 20px 25px -5px rgba(0, 0,0,0.1)",
    marginTop: "4px"
  }),
  singleValue: (provided) => ({ ...provided, fontSize: "14px", color: "#111827" }),
  placeholder: (provided) => ({ ...provided, color: "#9ca3af", fontSize: "14px" }),
  dropdownIndicator: (provided) => ({ ...provided, color: "#6b7280", "&:hover": { color: "#10b981" } })
};

const ExpenseCalculator = () => {
  // Convert to React Select format
  const mandiOptions = mandiData.map(mandi => ({
    value: mandi.name,
    label: mandi.name
  }));

  const [selectedMandi, setSelectedMandi] = useState(null);
  const [fuelPrice, setFuelPrice] = useState('102');
  const [mileage, setMileage] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const calculateExpense = () => {
    if (!selectedMandi || !mileage || !fuelPrice) return 0;
    
    const mandi = mandiData.find(m => m.name === selectedMandi.value);
    if (!mandi) return 0;
    
    const totalDistance = isRoundTrip ? mandi.distance * 2 : mandi.distance;
    const litersNeeded = totalDistance / parseFloat(mileage);
    const totalCost = litersNeeded * parseFloat(fuelPrice);
    
    return totalCost.toFixed(2);
  };

  const handleApply = () => {
    if (selectedMandi && mileage && fuelPrice) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedMandi(null);
    setMileage('');
    setFuelPrice('102');
    setIsRoundTrip(true);
    setShowResult(false);
  };

  const mandiDistance = mandiData.find(m => m.name === selectedMandi?.value)?.distance || 0;
  const totalDistance = isRoundTrip ? mandiDistance * 2 : mandiDistance;
  const litersNeeded = mileage ? (totalDistance / parseFloat(mileage)).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-4 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center leading-tight">
          Expense Calculator
        </h1>
        
        {/* RESULT - Only visible after Apply button */}
        {showResult && selectedMandi && (
          <div className="bg-white border-4 border-emerald-400 shadow-2xl rounded-2xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">{selectedMandi.label}</h2>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-2">
                  ₹{calculateExpense()}
                </div>
                <p className="text-base sm:text-lg text-gray-700">
                  Fuel: ₹{fuelPrice}/L | Mileage: {mileage} km/L | {isRoundTrip ? 'Round Trip' : 'One Way'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:text-base bg-gray-50 p-3 sm:p-4 rounded-xl">
                <div>Distance: <span className="font-bold text-gray-900">{mandiDistance} km</span></div>
                <div>Total: <span className="font-bold text-gray-900">{totalDistance} km</span></div>
                <div>Liters: <span className="font-bold text-emerald-600">{litersNeeded} L</span></div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-bold shadow-xl border-2 border-red-500 transition-all duration-200"
            >
              Reset
            </button>
          </div>
        )}

        {/* Controls + Apply Button */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* React Select Dropdown - SAME AS OTHER PAGES */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mandi Name</label>
              <Select
                options={mandiOptions}
                value={selectedMandi}
                onChange={setSelectedMandi}
                placeholder="Search & Select Mandi..."
                isSearchable
                styles={customSelectStyles}
                maxMenuHeight={200}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Price (₹/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage (km/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <input
                type="checkbox"
                id="roundTrip"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
                className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500 mr-3 flex-shrink-0"
              />
              <label htmlFor="roundTrip" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                Round Trip
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleApply}
                disabled={!selectedMandi || !mileage || !fuelPrice}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl border-4 border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                Calculate Expense
              </button>
            </div>
          </div>
        </div>

{/* Mandi List Table - EMERALD THEME WITH STICKY COLUMN */}
<div className="bg-white shadow-2xl rounded-2xl overflow-hidden mt-6">
  <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 sm:px-6 py-3 sm:py-4 text-white shadow-lg">
    <h2 className="text-base sm:text-xl font-bold">Mandi List</h2>
  </div>

  {/* Scrollable wrapper */}
  <div className="overflow-x-auto">
    <table className="min-w-max w-full table-fixed border-collapse">
      <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white border-b-4 border-emerald-300 shadow-lg">
        <tr>
          <th className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-sm sm:text-base sticky left-0 bg-gradient-to-r from-emerald-600 to-emerald-500 z-30 whitespace-nowrap border-r-2 border-emerald-400">
            Mandi Name
          </th>
          <th className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-sm sm:text-base text-left whitespace-nowrap">
            Distance (km)
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100">
        {mandiData.map((mandi, index) => (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base bg-white sticky left-0 z-20 whitespace-nowrap uppercase">
              {mandi.name}
            </td>
            <td className="px-2 sm:px-4 py-3 sm:py-4 font-mono text-emerald-600 text-sm sm:text-base whitespace-nowrap font-bold">
              {mandi.distance} km
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      </div>
    </div>
  );
};

export default ExpenseCalculator;
