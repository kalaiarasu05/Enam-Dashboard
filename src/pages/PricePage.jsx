import { useEffect, useState, useMemo, useRef } from "react";
import { fetchAPMCs, fetchTradeData } from "../services/enamApi";

export default function PricePage() {
  const [apmcs, setApmcs] = useState([]);
  const [selectedApmc, setSelectedApmc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dropdownRef = useRef(null);

  // Prefill dates (7 days ago → today)
  useEffect(() => {
    const todayObj = new Date();
    const today = todayObj.toISOString().split("T")[0];

    const sevenDaysAgoObj = new Date();
    sevenDaysAgoObj.setDate(todayObj.getDate() - 7);
    const sevenDaysAgo = sevenDaysAgoObj.toISOString().split("T")[0];

    setFromDate(sevenDaysAgo);
    setToDate(today);
  }, []);

  // Fetch APMCs
  useEffect(() => {
    fetchAPMCs()
      .then((res) => {
        const apmcList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setApmcs(apmcList);
      })
      .catch((err) => console.error("APMC Fetch Error:", err));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered mandis
  const filteredApmcs = useMemo(() => {
    return apmcs.filter((apmc) =>
      apmc.apmc_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, apmcs]);

  async function handleApply(apmc = selectedApmc, start = fromDate, end = toDate) {
    if (!start || !end) return;

    try {
      setLoading(true);

      const res = await fetchTradeData({
        apmcName: apmc,
        fromDate: start,
        toDate: end,
      });

      const tradeList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setData(tradeList);
      setCurrentPage(1);
    } catch (err) {
      console.error("Trade Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Auto apply on page load
  useEffect(() => {
    if (fromDate && toDate) {
      handleApply("", fromDate, toDate);
    }
  }, [fromDate, toDate]);

  function handleSort(key) {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (
      [
        "min_price",
        "modal_price",
        "max_price",
        "commodity_arrivals",
        "commodity_traded",
      ].includes(sortConfig.key)
    ) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }

    if (sortConfig.key === "created_at") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (valueA < valueB)
      return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB)
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="p-2 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
        Price Details
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Searchable Dropdown */}
        <div className="flex flex-col relative" ref={dropdownRef}>
          <label className="text-gray-700 text-sm mb-1">Select Mandi</label>

          <input
            type="text"
            value={selectedApmc}
            placeholder="All Mandis"
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedApmc(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="border p-2 rounded shadow-sm w-full"
          />

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-md max-h-60 overflow-y-auto z-50">
              <div
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedApmc("");
                  setSearchTerm("");
                  setIsDropdownOpen(false);
                }}
              >
                All Mandis
              </div>

              {filteredApmcs.map((apmc) => (
                <div
                  key={apmc.apmc_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedApmc(apmc.apmc_name);
                    setSearchTerm(apmc.apmc_name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {apmc.apmc_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">Start Date</label>
          <input
            type="date"
            className="border p-2 rounded shadow-sm w-full"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={today}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">End Date</label>
          <input
            type="date"
            className="border p-2 rounded shadow-sm w-full"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            max={today}
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            onClick={() => handleApply()}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded p-2 font-medium disabled:opacity-50 w-full"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Table + Pagination (UNCHANGED FROM YOUR LOGIC) */}
      {!loading && data.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm whitespace-nowrap">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 text-left">APMC</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-right">Max</th>
                  <th className="p-2 text-right">Modal</th>
                  <th className="p-2 text-right">Min</th>
                  <th className="p-2 text-right">Arrivals</th>
                  <th className="p-2 text-right">Traded</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2">{item.apmc}</td>
                    <td className="p-2">{item.created_at}</td>
                    <td className="p-2 text-right">{item.max_price}</td>
                    <td className="p-2 text-right">{item.modal_price}</td>
                    <td className="p-2 text-right">{item.min_price}</td>
                    <td className="p-2 text-right">{item.commodity_arrivals}</td>
                    <td className="p-2 text-right">{item.commodity_traded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-3 border-t bg-gray-50 text-sm">
            <div>
              Showing {startIndex + 1}–
              {Math.min(endIndex, sortedData.length)} of {sortedData.length}
            </div>

            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>

              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Prev
              </button>
              <span>{currentPage} / {totalPages || 1}</span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
