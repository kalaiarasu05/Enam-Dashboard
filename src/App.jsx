import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import PricePage from "./pages/PricePage";
import ComparisonPage from "./pages/ComparisonPage";
import ExpenseCalculator from "./pages/ExpenseCalculator";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header - EMERALD GRADIENT */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-2xl p-4 sm:p-6 text-xl sm:text-2xl font-bold">
        <div className="max-w-6xl mx-auto text-center">
          eNAM Trade Dashboard
        </div>
      </header>

      {/* Navigation Tabs - EMERALD ACCENTS */}
      <div className="bg-white shadow-xl border-b-4 border-emerald-200 flex justify-center gap-8 py-4 px-4 sm:px-6">
        <NavLink
          to="/price"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-600 font-bold text-lg border-b-4 border-emerald-500 px-4 py-3 rounded-t-xl shadow-md bg-emerald-50 transition-all duration-200"
              : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-semibold px-4 py-3 rounded-t-xl transition-all duration-200"
          }
        >
          Price Details
        </NavLink>

        <NavLink
          to="/comparison"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-600 font-bold text-lg border-b-4 border-emerald-500 px-4 py-3 rounded-t-xl shadow-md bg-emerald-50 transition-all duration-200"
              : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-semibold px-4 py-3 rounded-t-xl transition-all duration-200"
          }
        >
          Comparison
        </NavLink>

        <NavLink
          to="/expense"
          className={({ isActive }) =>
            isActive
              ? "text-emerald-600 font-bold text-lg border-b-4 border-emerald-500 px-4 py-3 rounded-t-xl shadow-md bg-emerald-50 transition-all duration-200"
              : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-semibold px-4 py-3 rounded-t-xl transition-all duration-200"
          }
        >
          Expense Calculator
        </NavLink>
      </div>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/price" />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/expense" element={<ExpenseCalculator />} />
        </Routes>
      </main>
    </div>
  );
}
