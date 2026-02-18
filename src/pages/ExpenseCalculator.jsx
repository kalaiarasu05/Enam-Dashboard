import { useState } from 'react';

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

const ExpenseCalculator = () => {
  const [selectedMandi, setSelectedMandi] = useState('');
  const [fuelPrice, setFuelPrice] = useState('102');
  const [mileage, setMileage] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const calculateExpense = () => {
    if (!selectedMandi || !mileage || !fuelPrice) return 0;
    
    const mandi = mandiData.find(m => m.name === selectedMandi);
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
    setSelectedMandi('');
    setMileage('');
    setFuelPrice('102');
    setIsRoundTrip(true);
    setShowResult(false);
  };

  const mandiDistance = mandiData.find(m => m.name === selectedMandi)?.distance || 0;
  const totalDistance = isRoundTrip ? mandiDistance * 2 : mandiDistance;
  const litersNeeded = mileage ? (totalDistance / parseFloat(mileage)).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-4 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center leading-tight">
          Copra Expense Calculator
        </h1>
        
        {/* RESULT - Only visible after Apply button */}
        {showResult && selectedMandi && (
          <div className="bg-white border-4 border-emerald-400 shadow-2xl rounded-2xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">{selectedMandi}</h2>
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
                <div>Liters: <span className="font-bold text-blue-600">{litersNeeded} L</span></div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold text-center text-sm sm:text-base"
            >
              Reset
            </button>
          </div>
        )}

        {/* Controls + Apply Button */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Mandi Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mandi Name</label>
              <select
                value={selectedMandi}
                onChange={(e) => setSelectedMandi(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base bg-white shadow-sm"
              >
                <option value="">Select Mandi</option>
                {mandiData.map((mandi) => (
                  <option key={mandi.name} value={mandi.name}>
                    {mandi.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fuel Price */}
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

              {/* Mileage */}
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

            {/* Round Trip */}
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

            {/* Apply Button */}
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

        {/* Mandi Table */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-white">
            <h2 className="text-base sm:text-xl font-bold">Mandi List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] sm:min-w-[320px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-b-2 border-blue-400">
                  <th className="text-left p-3 sm:p-4 font-bold text-white text-sm sm:text-base">Mandi Name</th>
                  <th className="text-left p-3 sm:p-4 font-bold text-white text-sm sm:text-base w-24">Distance</th>
                </tr>
              </thead>
              <tbody>
                {mandiData.map((mandi, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                    <td className="p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">{mandi.name}</td>
                    <td className="p-3 sm:p-4 text-gray-700 font-bold text-emerald-600 text-center text-lg sm:text-xl font-mono">
                      {mandi.distance}km
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
