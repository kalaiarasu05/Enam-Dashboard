import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { fetchAPMCs, fetchTradeData } from "../services/enamApi";

// Same custom styles as ComparisonPage
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

export default function PricePage() {
  const [apmcs, setApmcs] = useState([]);
  const [selectedApmc, setSelectedApmc] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const today = new Date().toISOString().split("T")[0];

  /* ================================
     ✅ SET DEFAULT DATES ON LOAD
  ================================= */
  useEffect(() => {
    const todayObj = new Date();
    const todayFormatted = todayObj.toISOString().split("T")[0];

    const sevenDaysAgoObj = new Date();
    sevenDaysAgoObj.setDate(todayObj.getDate() - 7);
    const sevenDaysAgoFormatted = sevenDaysAgoObj.toISOString().split("T")[0];

    setFromDate(sevenDaysAgoFormatted);
    setToDate(todayFormatted);
  }, []);

  /* ================================
     ✅ FETCH APMCS & SET DEFAULT "All Mandis"
  ================================= */
  useEffect(() => {
    async function loadAPMCs() {
      try {
        const res = await fetchAPMCs();

        if (Array.isArray(res)) {
         setApmcs(res);
        }
        else if (Array.isArray(res?.data)) {
         setApmcs(res.data);
        }
        else {
         setApmcs([]);
        }

        // Set default "All Mandis" after APMCs load
        setSelectedApmc({ value: "", label: "All Mandis" });
      } catch (err) {
        console.error("APMC fetch error:", err);
        setApmcs([]);
      }
    }
    loadAPMCs();
  }, []);

  /* ================================
     ✅ AUTO APPLY (UNCHANGED LOGIC)
  ================================= */
  useEffect(() => {
    if (fromDate && toDate) {
      handleApply();
    }
  }, [selectedApmc?.value, fromDate, toDate]);

  async function handleApply() {
    if (!fromDate || !toDate) return;

    try {
      setLoading(true);
      const apmcNameToSend = selectedApmc?.value || "";
      const res = await fetchTradeData({
        apmcName: apmcNameToSend,
        fromDate,
        toDate
      });
      setData(res?.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key) {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  }

  // Convert APMCs to React Select format + Add "All Mandis" as default first option
  const mandiOptions = [
    { value: "", label: "All Mandis" },
    ...apmcs.map(apmc => ({
      value: apmc.apmc_name,
      label: apmc.apmc_name
    }))
  ];

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (["min_price", "modal_price", "max_price", "commodity_arrivals", "commodity_traded"].includes(sortConfig.key)) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }

    if (sortConfig.key === "created_at") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-4 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center leading-tight">
          Price Details
        </h1>

        {/* Controls */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* React Select Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mandi Name</label>
              <Select
                options={mandiOptions}
                value={selectedApmc}
                onChange={setSelectedApmc}
                placeholder="Search & Select Mandi..."
                isSearchable
                styles={customSelectStyles}
                maxMenuHeight={200}
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-base"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                max={today}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-base"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                max={today}
              />
            </div>

            {/* Apply Button */}
            <div className="flex items-end pt-2">
              <button
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl border-4 border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? "Loading..." : "Apply"}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            <div className="text-lg font-semibold text-emerald-600">Fetching trade data...</div>
          </div>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            <div className="text-lg text-gray-500">No data available.</div>
          </div>
        )}

        {/* Table with CLEAN EMERALD HEADER - NO EMOJIS */}
        {!loading && data.length > 0 && (
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 sm:px-6 py-3 sm:py-4 text-white shadow-lg">
              <h2 className="text-base sm:text-xl font-bold">Trade Data</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white border-b-4 border-emerald-300 shadow-lg">
                  <tr>
                    <th 
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base sticky left-0 bg-gradient-to-r from-emerald-600 to-emerald-500 z-30 border-r-2 border-emerald-400 shadow-md"
                    >
                      APMC
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base sticky left-32 bg-gradient-to-r from-emerald-500 to-teal-500 z-20 cursor-pointer hover:bg-teal-400 hover:shadow-md transition-all duration-200 border-r border-emerald-400"
                    >
                      Date {sortConfig.key === "created_at" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      onClick={() => handleSort("max_price")}
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base text-right cursor-pointer hover:bg-emerald-400 hover:shadow-md transition-all duration-200 border-r border-emerald-400"
                    >
                      Max {sortConfig.key === "max_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      onClick={() => handleSort("modal_price")}
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base text-right cursor-pointer hover:bg-emerald-400 hover:shadow-md transition-all duration-200 border-r border-emerald-400"
                    >
                      Modal {sortConfig.key === "modal_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      onClick={() => handleSort("min_price")}
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base text-right cursor-pointer hover:bg-emerald-400 hover:shadow-md transition-all duration-200 border-r border-emerald-400"
                    >
                      Min {sortConfig.key === "min_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      onClick={() => handleSort("commodity_arrivals")}
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base text-right cursor-pointer hover:bg-teal-400 hover:shadow-md transition-all duration-200 border-r border-emerald-400"
                    >
                      Arrivals {sortConfig.key === "commodity_arrivals" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      onClick={() => handleSort("commodity_traded")}
                      className="p-3 sm:p-4 font-bold text-white text-sm sm:text-base text-right cursor-pointer hover:bg-teal-400 hover:shadow-md transition-all duration-200"
                    >
                      Traded {sortConfig.key === "commodity_traded" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base bg-white sticky left-0 z-10">{item.apmc}</td>
                      <td className="p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base bg-white sticky left-32 z-10">{item.created_at}</td>
                      <td className="p-3 sm:p-4 text-right font-mono text-emerald-600 text-sm sm:text-base">{item.max_price}</td>
                      <td className="p-3 sm:p-4 text-right font-mono text-emerald-600 text-sm sm:text-base">{item.modal_price}</td>
                      <td className="p-3 sm:p-4 text-right font-mono text-emerald-600 text-sm sm:text-base">{item.min_price}</td>
                      <td className="p-3 sm:p-4 text-right font-mono text-gray-700 text-sm sm:text-base">{item.commodity_arrivals}</td>
                      <td className="p-3 sm:p-4 text-right font-mono text-gray-700 text-sm sm:text-base">{item.commodity_traded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-4 border-t border-emerald-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm sm:text-base">
                <div className="text-gray-600 font-semibold">
                  Showing {startIndex + 1}–{Math.min(endIndex, sortedData.length)} of {sortedData.length} records
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="p-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Prev
                  </button>
                  <span className="font-bold text-gray-900 px-4 py-2 bg-white rounded-xl shadow-sm">{currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
