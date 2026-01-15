import { ChevronDown, MoreHorizontal } from "lucide-react";
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

export const ProjectsWorkload = () => {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-foreground">Charge de travail</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 border border-border/50 rounded-lg hover:bg-secondary transition-all">
            3 mois
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadData} barCategoryGap="20%">
            <defs>
              <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.7} />
                <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
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
              radius={[6, 6, 6, 6]}
            >
              {workloadData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === "Dmitry" ? "url(#highlightGradient)" : "url(#defaultGradient)"}
                  style={{ filter: entry.name === "Dmitry" ? 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4))' : 'none' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Values */}
      <div className="flex justify-between px-2 mb-4">
        {workloadData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className={`text-xs font-bold ${item.name === "Dmitry" ? "text-primary" : "text-foreground"}`}>
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="flex justify-between px-1 pt-4 border-t border-border/50">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all duration-200 ${member.name === "Dmitry"
              ? "border-primary shadow-lg shadow-primary/20 scale-105"
              : "border-border/50 group-hover:border-primary/50 group-hover:scale-105"
              }`}>
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`text-[10px] font-medium ${member.name === "Dmitry" ? "text-primary" : "text-muted-foreground"
              }`}>
              {member.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
