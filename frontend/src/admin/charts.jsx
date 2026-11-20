import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompactPrice, formatPrice } from '../lib/format'

const INK = '#0a0a0b'
const GRID = '#eeece6'
const AXIS = { fontSize: 11, fill: '#9a958c' }

const fmtDay = (d) => {
  if (/^\d{4}-\d{2}$/.test(d)) return new Date(`${d}-01`).toLocaleDateString('en-IN', { month: 'short' })
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-muted">{fmtDay(label)}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{metric === 'orders' ? `${p.orders} orders` : formatPrice(p.revenue)}</p>
      {metric !== 'orders' && <p className="text-muted">{p.orders} orders</p>}
    </div>
  )
}

/** Single-series trend chart (revenue or orders) — one colour, quiet grid, readable axes. */
export function TrendChart({ data, metric = 'revenue', height = 260 }) {
  const empty = !data?.some((d) => d[metric] > 0)
  return (
    <div className="relative" style={{ height }}>
      {empty && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="rounded-full bg-white/90 px-3 py-1.5 text-xs text-muted ring-1 ring-line">No sales in this period yet</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INK} stopOpacity={0.14} />
              <stop offset="100%" stopColor={INK} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtDay} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={metric === 'orders' ? 28 : 52}
            allowDecimals={false}
            tickFormatter={metric === 'orders' ? undefined : formatCompactPrice}
          />
          <Tooltip content={<ChartTooltip metric={metric} />} cursor={{ stroke: '#d6d2ca', strokeDasharray: 3 }} />
          <Area isAnimationActive={false} type="monotone" dataKey={metric} stroke={INK} strokeWidth={2} fill={`url(#fill-${metric})`} activeDot={{ r: 4, fill: INK, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Horizontal bars for ranked categories. */
export function RankBars({ data, valueKey = 'revenue', labelKey = 'name', height = 220 }) {
  if (!data?.length) return <p className="py-10 text-center text-sm text-muted">No data for this period</p>
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey={labelKey} tick={{ ...AXIS, fill: '#6f6b64' }} tickLine={false} axisLine={false} width={110} />
          <Tooltip
            cursor={{ fill: '#f6f5f2' }}
            formatter={(v) => (valueKey === 'revenue' ? formatPrice(v) : v)}
            contentStyle={{ borderRadius: 12, border: '1px solid #e7e4de', fontSize: 12 }}
          />
          <Bar isAnimationActive={false} dataKey={valueKey} fill={INK} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
