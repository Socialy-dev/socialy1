import { ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const workloadData = [
  { name: "Sam", value: 7, top: 0 },
  { name: "Meldy", value: 8, top: 0 },
  { name: "Ken", value: 2, top: 0 },
  { name: "Dmitry", value: 10, top: 10 },
  { name: "Vego", value: 8, top: 0 },
  { name: "Kadin", value: 2, top: 0 },
  { name: "Melm", value: 4, top: 0 },
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
    <div className="glass-card rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Projects Workload</h3>
        <button className="flex items-center gap-1 px-4 py-2 text-sm text-foreground bg-background/50 rounded-full hover:bg-background transition-colors border border-border">
          Last 3 months
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadData} barCategoryGap="30%">
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={false}
            />
            <YAxis hide />
            <Bar 
              dataKey="value" 
              radius={[20, 20, 20, 20]}
              fill="#060606"
            >
              {workloadData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === "Dmitry" ? "#E65F2B" : "#060606"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Values on top of bars */}
      <div className="flex justify-between px-2 mb-6">
        {workloadData.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="flex justify-between px-2 pt-4 border-t border-border/30">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background">
              <img 
                src={member.avatar} 
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-muted-foreground">{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
