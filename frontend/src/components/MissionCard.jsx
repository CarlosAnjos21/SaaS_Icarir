export default function MissionCard({ mission }) {
  return (
    <div className="bg-white border border-blue rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-blue mb-2">{mission.title}</h3>
      <p className="text-sm text-dark">Earn <span className="text-orange font-semibold">{mission.xp} XP</span></p>
    </div>
  );
}