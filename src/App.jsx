import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import PricePage from "./pages/PricePage";
import ComparisonPage from "./pages/ComparisonPage";
import ExpenseCalculator from "./pages/ExpenseCalculator"; // Add this import

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 text-xl font-semibold">
        eNAM Trade Dashboard
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow flex justify-center gap-6 py-3">
        <NavLink
          to="/price"
          className={({ isActive }) =>
            isActive
              ? "text-green-600 font-semibold border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600 transition-colors"
          }
        >
          Price Details
        </NavLink>

        <NavLink
          to="/comparison"
          className={({ isActive }) =>
            isActive
              ? "text-green-600 font-semibold border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600 transition-colors"
          }
        >
          Comparison
        </NavLink>

        <NavLink
          to="/expense"
          className={({ isActive }) =>
            isActive
              ? "text-green-600 font-semibold border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600 transition-colors"
          }
        >
          Expense Calculator
        </NavLink>
      </div>

      {/* Page Content */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/price" />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/expense" element={<ExpenseCalculator />} />
        </Routes>
      </div>
    </div>
  );
}
