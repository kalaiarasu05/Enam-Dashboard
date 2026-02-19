import { useEffect, useState } from "react";
import Select from "react-select";
import { fetchAPMCs, fetchTradeData } from "../services/enamApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatMonthYear(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("default", { month: "short", year: "2-digit" });
}

const COLORS = ["#16a34a", "#2563eb", "#dc2626", "#f59e0b"];

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

export default function ComparisonPage() {
  const [apmcs, setApmcs] = useState([]);
  const [selectedMandis, setSelectedMandis] = useState([null]);
  const [priceType, setPriceType] = useState("max_price");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mergedData, setMergedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function init() {
      const mandiList = await fetchAPMCs();

      const formatted = (mandiList || []).map((m) => ({
        value: m.apmc_name,
        label: m.apmc_name,
      }));

      setApmcs(formatted);

      // ✅ ONE MONTH AGO (30 days)
      const todayDate = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(todayDate.getDate() - 30);

      setToDate(formatDate(todayDate));
      setFromDate(formatDate(oneMonthAgo));
    }

    init();
  }, []);

  function handleMandiChange(index, option) {
    const updated = [...selectedMandis];
    updated[index] = option;
    setSelectedMandis(updated);
  }

  function addMandiDropdown() {
    if (selectedMandis.length >= 4) {
      alert("Maximum 4 mandis allowed");
      return;
    }
    setSelectedMandis([...selectedMandis, null]);
  }

  function removeMandi(index) {
    const updated = selectedMandis.filter((_, i) => i !== index);
    setSelectedMandis(updated);
  }

  function getFilteredOptions(currentIndex) {
    const selectedValues = selectedMandis
      .filter((m, i) => i !== currentIndex && m)
      .map((m) => m.value);

    return apmcs.filter(
      (option) =>
        !selectedValues.includes(option.value) ||
        option.value === selectedMandis[currentIndex]?.value
    );
  }

  async function handleCompare() {
    const validMandis = selectedMandis
      .filter((m) => m)
      .map((m) => m.value);

    if (validMandis.length === 0) {
      alert("Select at least one mandi");
      return;
    }

    setLoading(true);

    try {
      const allResults = {};
      const allDates = new Set();

      for (const mandi of validMandis) {
        const res = await fetchTradeData({
          apmcName: mandi,
          fromDate,
          toDate,
        });

        const mandiData = res?.data || [];

        mandiData.forEach((item) => {
          const date = item.created_at;
          allDates.add(date);

          if (!allResults[date]) {
            allResults[date] = { date };
          }

          allResults[date][mandi] = Number(item[priceType]);
        });
      }

      allDates.forEach((date) => {
        if (!allResults[date]) {
          allResults[date] = { date };
        }

        validMandis.forEach((mandi) => {
          if (!(mandi in allResults[date])) {
            allResults[date][mandi] = null;
          }
        });
      });

      const mergedArray = Object.values(allResults).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setMergedData(mergedArray);
      setCurrentPage(1);
    } catch (error) {
      console.error("Comparison Error:", error);
      setMergedData([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(mergedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = mergedData.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-4 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center leading-tight">
          Mandi Comparison
        </h1>

        {/* Controls */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mb-6">
          <div className="space-y-4 lg:grid lg:grid-cols-5 lg:gap-4 lg:space-y-0">
            {/* Mandi Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Mandi Name</label>
              {selectedMandis.map((mandi, index) => (
                <div key={index} className="flex gap-2 mb-3 items-end">
                  <div className="flex-1 w-full">
                    <Select
                      options={getFilteredOptions(index)}
                      value={mandi}
                      onChange={(option) => handleMandiChange(index, option)}
                      placeholder="Search & Select Mandi..."
                      isSearchable
                      styles={customSelectStyles}
                      maxMenuHeight={200}
                    />
                  </div>
                  {selectedMandis.length > 1 && (
                    <button
                      onClick={() => removeMandi(index)}
                      className="w-10 h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center shadow-lg transition-all flex-shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addMandiDropdown}
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm mt-1 hover:underline"
              >
                + Add Mandi (Max 4)
              </button>
            </div>

            {/* Other Controls */}
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Type</label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-base"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                >
                  <option value="max_price">Max Price</option>
                  <option value="modal_price">Modal Price</option>
                  <option value="min_price">Min Price</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-base"
                  value={fromDate}
                  max={today}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-base"
                  value={toDate}
                  max={today}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <div className="pt-6 lg:pt-0">
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl border-4 border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? "Loading..." : "Compare"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center mb-6">
            <div className="text-lg font-semibold text-emerald-600">Loading comparison data...</div>
          </div>
        )}

        {/* Chart */}
        {mergedData.length > 0 && (
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 sm:px-6 py-3 sm:py-4 text-white shadow-lg">
              <h2 className="text-base sm:text-xl font-bold">Price Comparison Chart</h2>
            </div>
            <div className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 300 : 400}>
                <LineChart data={mergedData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatMonthYear}
                    fontSize={12}
                    tickMargin={8}
                  />
                  <YAxis width={50} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Brush
                    dataKey="date"
                    height={window.innerWidth < 640 ? 20 : 30}
                    stroke="#10b981"
                    tickFormatter={formatMonthYear}
                  />
                  {selectedMandis
                    .filter((m) => m)
                    .map((mandi, index) => (
                      <Line
                        key={mandi.value}
                        type="monotone"
                        dataKey={mandi.value}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={3}
                        connectNulls
                        dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {paginatedData.length > 0 && (
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 sm:px-6 py-3 sm:py-4 text-white shadow-lg">
              <h2 className="text-base sm:text-xl font-bold">Comparison Table</h2>
            </div>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-100">
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white border-b-4 border-emerald-300 shadow-lg">
                  <tr>
                    <th className="p-2 sm:p-4 font-bold text-white text-xs sm:text-base text-left sticky left-0 bg-gradient-to-r from-emerald-600 to-emerald-500 z-30 border-r-2 border-emerald-400 shadow-md">
                      Date
                    </th>
                    {selectedMandis.filter((m) => m).map((m) => (
                      <th
                        key={m.value}
                        className="p-2 sm:p-4 font-bold text-white text-xs sm:text-base text-left cursor-pointer hover:bg-teal-400 hover:shadow-md transition-all duration-200"
                      >
                        {m.label.length > 15 ? m.label.slice(0, 15) + '...' : m.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-2 sm:p-4 font-semibold text-gray-900 text-xs sm:text-base bg-white sticky left-0 z-10 whitespace-nowrap">
                        {row.date}
                      </td>
                      {selectedMandis.filter((m) => m).map((m) => (
                        <td
                          key={m.value}
                          className="p-2 sm:p-4 text-left font-mono text-emerald-600 font-semibold text-xs sm:text-base whitespace-nowrap"
                        >
                          {row[m.value] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-4 border-t border-emerald-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm sm:text-base">
                <div className="text-gray-600 font-semibold">
                  Showing {startIndex + 1}–{Math.min(endIndex, mergedData.length)} of {mergedData.length} records
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="p-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Prev
                  </button>
                  <span className="font-bold text-gray-900 px-4 py-2 bg-white rounded-xl shadow-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}