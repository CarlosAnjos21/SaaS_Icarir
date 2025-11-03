import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog6ToothIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const pontos = parsed.pontos || 1200;
        const descricaoPersonalizada = getDescricao(parsed.name);

        const enrichedUser = {
          ...parsed,
          pontos,
          descricao: descricaoPersonalizada,
        };

        setUser(enrichedUser);
        setForm({
          name: enrichedUser.name,
          email: enrichedUser.email,
          description: enrichedUser.descricao,
          image: enrichedUser.image || "",
        });
        setLoading(false);
      } else {
        navigate("/register");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate("/register");
    }
  }, [navigate]);

  const getDescricao = (name) => {
    if (name.includes("Carlos")) return "IT Student - Full Stack Dev";
    if (name.includes("Ana"))
      return "UX/UI Designer passionate about innovation";
    if (name.includes("João")) return "Data and AI Specialist";
    return "Member of the Atlântico Avanti community";
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    navigate("/logout");
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: form.name,
      email: form.email,
      description: form.description,
      image: form.image,
    };
    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#394C97] font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#FEF7EC] to-[#394C97] flex flex-col items-center pt-[50px] px-4"
    >
      <div className="w-full max-w-4xl bg-white/30 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/40">
        <div className="flex flex-col items-center py-8 px-6 border-b border-[#394C97]/30">
          <br />
          <br />
        </div>

        <div className="flex justify-start -mt-12 mb-6 px-6">
          <div className="w-32 h-32 ml-[80px] rounded-full overflow-hidden border-2 border-white shadow-lg bg-[#FEF7EC] flex items-center justify-center">
            {form.image ? (
              <img
                src={form.image}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-28 w-28 text-[#394C97]" />
            )}
          </div>
        </div>

        <div className="px-6 pb-8 text-left">
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FEF7EC] text-[#394C97] rounded-full hover:bg-[#FE5900]/20 transition"
            >
              <PencilSquareIcon className="h-5 w-5" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#FEF7EC] text-[#394C97] rounded-full hover:bg-[#FE5900]/20 transition">
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </button>
          </div>

          <div className="text-left mb-4 ml-[80px]">
            <h1 className="text-2xl font-bold text-[#394C97] mb-2">
              {user.name}
            </h1>
            <p className="text-sm text-[#FE5900]">{user.description}</p>
          </div>

          {isEditing ? (
            <div className="space-y-4 text-left max-w-md mx-auto">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={handleChange("name")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="About you"
                value={form.description}
                onChange={handleChange("description")}
                className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
              />
              <input
                type="text"
                placeholder="Profile image URL"
                value={form.image}
                onChange={handleChange("image")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleSave}
                className="w-full py-2 bg-[#394C97] text-white rounded-lg hover:bg-[#FE5900] transition hover:shadow-md"
              >
                Save changes
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600 ml-[80px] space-y-2 max-w-md mx-auto text-left">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Initials:</strong> {getInitials(user.name)}
              </p>
              <p>
                <strong>Total points:</strong> {user.pontos}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-6 text-[#394C97] font-semibold text-sm">
            <span>Level (0)</span>
            <span>Comments (0)</span>
            <span>Posts (0)</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 px-6 py-2 bg-[#394C97] text-white rounded-full font-semibold shadow hover:bg-[#FE5900] transition duration-300"
      >
        Log Out
      </button>
    </motion.div>
  );
}
