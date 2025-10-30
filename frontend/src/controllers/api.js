export async function createMission(mission) {
  const res = await fetch("http://localhost:3001/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mission),
  });
  return await res.json();
}

export async function getMissions() {
  const res = await fetch("http://localhost:3001/api/missions");
  return await res.json();
}