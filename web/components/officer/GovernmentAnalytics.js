'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Users,
  Camera,
  Clock,
  TrendingUp,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

const COLORS = ['#FF6748', '#172B4D', '#159A8A', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function GovernmentAnalytics({ stats, charts }) {
  const {
    total = 0,
    citizen = 0,
    ai = 0,
    pending = 0,
    resolved = 0,
    resolutionRate = 0,
    officers = 0,
    departments = 0,
  } = stats || {};

  const trendData = charts?.trendData || [];
  const categoryChartData = charts?.categoryChartData || [];

  const sourceData = total > 0 ? [
    { name: 'Citizen Reports', value: citizen },
    { name: 'AI / CCTV Vision', value: ai },
  ] : [
    { name: 'No Data', value: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Complaints */}
        <div className="civic-card p-5 border-border hover:border-navy/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Total Complaints
            </span>
            <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-navy">{total}</div>
          <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span>
            <span>audited tickets</span>
          </div>
        </div>

        {/* Citizen Complaints */}
        <div className="civic-card p-5 border-border hover:border-coral/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-coral">
              Citizen Complaints
            </span>
            <div className="w-8 h-8 rounded-lg bg-coral/10 text-coral flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-coral">{citizen}</div>
          <div className="text-xs text-text-secondary mt-1">
            {total > 0 ? `${Math.round((citizen / total) * 100)}% of total volume` : 'User filed'}
          </div>
        </div>

        {/* AI Detections */}
        <div className="civic-card p-5 border-border hover:border-teal/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              AI Detections (CCTV)
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
              <Camera size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-teal">{ai}</div>
          <div className="text-xs text-text-secondary mt-1">
            {total > 0 ? `${Math.round((ai / total) * 100)}% automated triage` : 'Neural cameras'}
          </div>
        </div>

        {/* Pending Issues */}
        <div className="civic-card p-5 border-border hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-amber-800">{pending}</div>
          <div className="text-xs text-text-secondary mt-1">
            Requires officer review
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Trend Line Chart (Linear/Stripe style) */}
        <div className="civic-card lg:col-span-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Complaints & Resolution Velocity
              </h3>
              <p className="text-xs text-text-secondary">
                Citizen submissions vs automated optical detections vs verified resolutions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1 text-coral">
                <span className="w-2.5 h-2.5 rounded-full bg-coral"></span> Citizen
              </span>
              <span className="flex items-center gap-1 text-navy">
                <span className="w-2.5 h-2.5 rounded-full bg-navy"></span> AI CCTV
              </span>
              <span className="flex items-center gap-1 text-teal">
                <span className="w-2.5 h-2.5 rounded-full bg-teal"></span> Resolved
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {trendData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#F3F3EC] rounded-2xl border border-dashed border-border">
                <TrendingUp size={32} className="text-text-secondary opacity-40 mb-2" />
                <span className="font-bold text-navy text-xs">No Trend Activity Logged</span>
                <span className="text-[11px] text-text-secondary max-w-sm mt-0.5">
                  Resolution and velocity curves will populate automatically as incidents are reported and closed.
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DADAD2" vertical={false} />
                  <XAxis dataKey="month" stroke="#77776F" fontSize={11} tickLine={false} />
                  <YAxis stroke="#77776F" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#172B4D',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="citizen"
                    stroke="#FF6748"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#FF6748' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ai"
                    stroke="#172B4D"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#172B4D' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#159A8A"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#159A8A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Citizen vs AI Ratio (Donut / Pie) */}
        <div className="civic-card lg:col-span-4 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-navy">
              Source Attribution
            </h3>
            <p className="text-xs text-text-secondary">
              Proportion of citizen vs AI-vision detected issues.
            </p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#FF6748" />
                  <Cell fill="#172B4D" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#172B4D',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black font-display text-navy">{total}</span>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-coral"></span>
                <span>Citizen Reports</span>
              </div>
              <span className="font-bold text-navy">{citizen}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-navy"></span>
                <span>AI CCTV Detection</span>
              </div>
              <span className="font-bold text-navy">{ai}</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Category Distribution Bar Chart */}
        <div className="civic-card lg:col-span-12 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Complaint Category Distribution
              </h3>
              <p className="text-xs text-text-secondary">
                Volume of incidents grouped across municipal functional areas.
              </p>
            </div>
            <div className="text-xs font-semibold text-teal flex items-center gap-1.5">
              <ShieldCheck size={15} />
              <span>SLA Target: 92% Compliance</span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#F3F3EC] rounded-2xl border border-dashed border-border">
                <Layers size={30} className="text-text-secondary opacity-40 mb-2" />
                <span className="font-bold text-navy text-xs">No Categorized Complaints</span>
                <span className="text-[11px] text-text-secondary max-w-sm mt-0.5">
                  Category breakdown will display when complaints are registered.
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DADAD2" vertical={false} />
                  <XAxis dataKey="name" stroke="#77776F" fontSize={11} tickLine={false} />
                  <YAxis stroke="#77776F" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#172B4D',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
