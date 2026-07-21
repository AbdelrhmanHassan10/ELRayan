import CountUp from "react-countup";

/*
  Props:
    - title (string)
    - value (number)
    - colorClass (tailwind bg color, e.g. "bg-blue-500")
    - icon (optional react node)
*/
export default function StatCard({ title, value, colorClass = "bg-blue-500", icon }) {
  return (
    <div className={`${colorClass} text-white rounded-xl p-5 shadow transform transition hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 capitalize">{title.replace(/([A-Z])/g, " $1")}</p>
          <p className="text-2xl font-extrabold mt-2">
            <CountUp start={0} end={value || 0} duration={1.6} separator="," />
          </p>
        </div>
        {icon && <div className="text-3xl opacity-90">{icon}</div>}
      </div>
    </div>
  );
}
