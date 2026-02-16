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
} from "recharts";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

const COLORS = ["#16a34a", "#2563eb", "#dc2626", "#f59e0b"];

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

  /* ----------------------------------
     Load Mandis + Default Dates
  ----------------------------------- */
  useEffect(() => {
    async function init() {
      const mandiList = await fetchAPMCs();

      const formatted = (mandiList || []).map((m) => ({
        value: m.apmc_name,
        label: m.apmc_name,
      }));

      setApmcs(formatted);

      const todayDate = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(todayDate.getDate() - 7);

      setToDate(formatDate(todayDate));
      setFromDate(formatDate(sevenDaysAgo));
    }

    init();
  }, []);

  /* ----------------------------------
     Handle Mandi Change
  ----------------------------------- */
  function handleMandiChange(index, option) {
    const updated = [...selectedMandis];
    updated[index] = option;
    setSelectedMandis(updated);
  }

  /* ----------------------------------
     Add Dropdown (Max 4)
  ----------------------------------- */
  function addMandiDropdown() {
    if (selectedMandis.length >= 4) {
      alert("Maximum 4 mandis allowed");
      return;
    }
    setSelectedMandis([...selectedMandis, null]);
  }

  /* ----------------------------------
     Remove Dropdown
  ----------------------------------- */
  function removeMandi(index) {
    const updated = selectedMandis.filter((_, i) => i !== index);
    setSelectedMandis(updated);
  }

  /* ----------------------------------
     Prevent Duplicate Mandis
  ----------------------------------- */
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

  /* ----------------------------------
     Fetch & Merge Data
  ----------------------------------- */
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

      for (const mandi of validMandis) {
        const res = await fetchTradeData({
          apmcName: mandi,
          fromDate,
          toDate,
        });

        const mandiData = res?.data || [];

        mandiData.forEach((item) => {
          const date = item.created_at;

          if (!allResults[date]) {
            allResults[date] = { date };
          }

          allResults[date][mandi] = Number(item[priceType]);
        });
      }

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

  /* ----------------------------------
     Pagination Logic
  ----------------------------------- */
  const totalPages = Math.ceil(mergedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = mergedData.slice(startIndex, endIndex);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Mandi Comparison
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

        {/* Mandis */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium">Select Mandis</label>

          {selectedMandis.map((mandi, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <div className="w-full">
                <Select
                  options={getFilteredOptions(index)}
                  value={mandi}
                  onChange={(option) =>
                    handleMandiChange(index, option)
                  }
                  placeholder="Search & Select Mandi..."
                  isSearchable
                />
              </div>

              {selectedMandis.length > 1 && (
                <button
                  onClick={() => removeMandi(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  X
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addMandiDropdown}
            className="text-blue-600 text-sm mt-1"
          >
            + Add Mandi
          </button>
        </div>

        {/* Price Type */}
        <div>
          <label className="text-sm font-medium">Price Type</label>
          <select
            className="border p-2 rounded w-full"
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
          >
            <option value="max_price">Max Price</option>
            <option value="modal_price">Modal Price</option>
            <option value="min_price">Min Price</option>
          </select>
        </div>

        {/* Dates */}
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={fromDate}
            max={today}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={toDate}
            max={today}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleCompare}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Chart */}
      {mergedData.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mergedData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedMandis
                .filter((m) => m)
                .map((mandi, index) => (
                  <Line
                    key={mandi.value}
                    type="monotone"
                    dataKey={mandi.value}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {paginatedData.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">
                  Date
                </th>
                {selectedMandis.filter((m) => m).map((m) => (
                  <th
                    key={m.value}
                    className="px-4 py-2 text-right font-semibold whitespace-nowrap"
                  >
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 text-left whitespace-nowrap">
                    {row.date}
                  </td>

                  {selectedMandis.filter((m) => m).map((m) => (
                    <td
                      key={m.value}
                      className="px-4 py-2 text-right whitespace-nowrap tabular-nums"
                    >
                      {row[m.value] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 border-t text-sm">

            <div className="flex items-center gap-2">
              <span>Show</span>
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
              <span>entries</span>
            </div>

            <div>
              Showing {startIndex + 1} –{" "}
              {Math.min(endIndex, mergedData.length)} of{" "}
              {mergedData.length}
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span>{currentPage} / {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 font-medium">
          Loading...
        </div>
      )}
    </div>
  );
}
