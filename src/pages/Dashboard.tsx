import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Users, Award } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Aktywni zawodnicy",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Treningi w tym tygodniu",
      value: "48",
      change: "+8%",
      icon: Activity,
      color: "text-accent",
    },
    {
      title: "Średnia wydajność",
      value: "87%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Osiągnięcia",
      value: "156",
      change: "+23",
      icon: Award,
      color: "text-violet-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Witaj ponownie!</h2>
        <p className="text-slate-600">Oto podsumowanie aktywności Twoich zawodników</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-emerald-600 mt-1">{stat.change} vs ostatni tydzień</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Ostatnie sesje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Trening siłowy - Grupa A</p>
                    <p className="text-sm text-slate-600">2 godziny temu</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Top zawodnicy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Jan Kowalski", score: "95%" },
                { name: "Anna Nowak", score: "92%" },
                { name: "Piotr Wiśniewski", score: "89%" },
              ].map((athlete, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      {athlete.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{athlete.name}</span>
                  </div>
                  <span className="font-semibold text-primary">{athlete.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
