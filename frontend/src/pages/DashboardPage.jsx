/**
 * @fileoverview Dashboard page showing aggregate stats across lists, items, tags, and colors.
 */

import { Link } from "react-router-dom";

import { useStats } from "../hooks/useStats";
import ErrorMessage from "../components/ui/ErrorMessage";
import Spinner from "../components/ui/Spinner";

/**
 * A single stat card displaying a label and numeric value.
 *
 * @param {object} props
 * @param {string} props.label - The stat label.
 * @param {number|string} props.value - The stat value.
 * @param {string} [props.sub] - Optional sub-label shown below value.
 * @param {string} [props.accent] - Optional Tailwind text color class for the value.
 * @returns {JSX.Element}
 */
function StatCard({ label, value, sub, accent = "text-body" }) {
  return (
    <div className="bg-surface border border-rule rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${accent}`}>{value}</span>
      {sub && <span className="text-xs text-secondary">{sub}</span>}
    </div>
  );
}

/**
 * Dashboard overview page with stats about lists, items, tags, and colors.
 *
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { data: stats, isLoading, error } = useStats();

  if (isLoading) return <div className="max-w-6xl mx-auto px-4 py-8"><Spinner /></div>;
  if (error) return <div className="max-w-6xl mx-auto px-4 py-8"><ErrorMessage error={error} /></div>;
  if (!stats) return null;

  const { totals, items_due_this_week, overdue_items, items_without_due_date, importance_breakdown, top_lists, top_tags } = stats;

  const completionPct = totals.items > 0
    ? Math.round((totals.completed_items / totals.items) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-body">Dashboard</h1>

      {/* Overview */}
      <section>
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Lists" value={totals.lists} />
          <StatCard label="Total Items" value={totals.items} />
          <StatCard label="Active" value={totals.active_items} accent="text-primary" />
          <StatCard label="Completed" value={totals.completed_items} accent="text-success"
            sub={`${completionPct}% done`} />
          <StatCard label="Colors" value={totals.colors} />
          <StatCard label="Tags" value={totals.tags} />
        </div>
      </section>

      {/* Due dates */}
      <section>
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">Due Dates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Overdue" value={overdue_items} accent={overdue_items > 0 ? "text-danger" : "text-body"} />
          <StatCard label="Due This Week" value={items_due_this_week} accent={items_due_this_week > 0 ? "text-caution" : "text-body"} />
          <StatCard label="No Due Date (Active)" value={items_without_due_date} />
        </div>
      </section>

      {/* Importance breakdown */}
      <section>
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">Active Items by Importance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="High" value={importance_breakdown.high} accent="text-danger" />
          <StatCard label="Medium" value={importance_breakdown.medium} accent="text-caution" />
          <StatCard label="Low" value={importance_breakdown.low} accent="text-success" />
          <StatCard label="None" value={importance_breakdown.none} />
        </div>
      </section>

      {/* Top lists + top tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top lists */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">Lists by Item Count</h2>
            <Link to="/lists" className="text-xs text-primary hover:text-primary-hover transition-colors">View all →</Link>
          </div>
          <div className="bg-surface border border-rule rounded-xl overflow-hidden">
            {top_lists.length === 0 ? (
              <p className="text-sm text-muted px-4 py-6 text-center">No lists yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary">List</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-secondary">Items</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-secondary">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {top_lists.map((list) => {
                    const pct = list.item_count > 0 ? Math.round((list.completed_count / list.item_count) * 100) : 0;
                    return (
                      <tr key={list.id} className="border-b border-rule last:border-0 hover:bg-inset transition-colors">
                        <td className="px-4 py-2.5">
                          <Link to={`/lists/${list.id}`} className="text-body hover:text-primary transition-colors">
                            {list.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-right text-secondary">{list.item_count}</td>
                        <td className="px-4 py-2.5 text-right text-muted">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Top tags */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">Most Used Tags</h2>
            <Link to="/tags" className="text-xs text-primary hover:text-primary-hover transition-colors">Manage →</Link>
          </div>
          <div className="bg-surface border border-rule rounded-xl overflow-hidden">
            {top_tags.length === 0 ? (
              <p className="text-sm text-muted px-4 py-6 text-center">No tags yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary">Tag</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-secondary">Used on</th>
                  </tr>
                </thead>
                <tbody>
                  {top_tags.map((tag) => (
                    <tr key={tag.id} className="border-b border-rule last:border-0 hover:bg-inset transition-colors">
                      <td className="px-4 py-2.5 text-body">{tag.name}</td>
                      <td className="px-4 py-2.5 text-right text-secondary">
                        {tag.usage_count} {tag.usage_count === 1 ? "item" : "items"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
