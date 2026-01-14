import { ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const workloadData = [
  { name: "Sam", value: 7 },
  { name: "Meldy", value: 8 },
  { name: "Ken", value: 2 },
  { name: "Dmitry", value: 10 },
  { name: "Vego", value: 8 },
  { name: "Kadin", value: 2 },
  { name: "Melm", value: 4 },
];

const teamMembers = [
  { name: "Sam", avatar: "https://i.pravatar.cc/40?img=1" },
  { name: "Meldy", avatar: "https://i.pravatar.cc/40?img=2" },
  { name: "Ken", avatar: "https://i.pravatar.cc/40?img=3" },
  { name: "Dmitry", avatar: "https://i.pravatar.cc/40?img=4" },
  { name: "Vego", avatar: "https://i.pravatar.cc/40?img=5" },
  { name: "Kadin", avatar: "https://i.pravatar.cc/40?img=6" },
  { name: "Melm", avatar: "https://i.pravatar.cc/40?img=7" },
];

// Modern gradient colors
const getBarColor = (index: number, isHighlight: boolean) => {
  if (isHighlight) return "url(#highlightGradient)";
  return "url(#defaultGradient)";
};

export const ProjectsWorkload = () => {
  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Projects Workload</h3>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground bg-secondary/50 border border-border rounded-xl hover:bg-secondary transition-all">
          Last 3 months
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Chart */}
      <div className="h-44 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadData} barCategoryGap="25%">
            <defs>
              <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(222, 47%, 20%)" />
                <stop offset="100%" stopColor="hsl(222, 47%, 11%)" />
              </linearGradient>
              <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(252, 85%, 65%)" />
                <stop offset="100%" stopColor="hsl(252, 85%, 50%)" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <YAxis hide />
            <Bar
              dataKey="value"
              radius={[8, 8, 8, 8]}
            >
              {workloadData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === "Dmitry" ? "url(#highlightGradient)" : "url(#defaultGradient)"}
                  style={{ filter: entry.name === "Dmitry" ? 'drop-shadow(0 4px 6px rgba(139, 92, 246, 0.3))' : 'none' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Values on top of bars */}
      <div className="flex justify-between px-3 mb-5">
        {workloadData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className={`text-sm font-bold ${item.name === "Dmitry" ? "text-primary" : "text-foreground"}`}>
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="flex justify-between px-1 pt-5 border-t border-border">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex flex-col items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 ${member.name === "Dmitry"
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border group-hover:border-primary/50"
              }`}>
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`text-xs font-medium ${member.name === "Dmitry" ? "text-primary" : "text-muted-foreground"
              }`}>
              {member.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
