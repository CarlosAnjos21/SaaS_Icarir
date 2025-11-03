import { useState } from "react";
import { saveFeedback } from "./feedbackUtils";

export default function FeedbackBar() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveFeedback({ ...form, date: new Date().toISOString() });
    setForm({ name: "", message: "" });
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-4 w-[300px] space-y-2 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-[#394C97]">Feedback</h3>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Seu nome"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Comentário..."
            className="w-full px-3 py-2 border rounded resize-none h-20"
            required
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-[#FE5900] text-white px-4 py-1 rounded hover:bg-orange-600"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Fechar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#394C97] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#2f3c7e] transition"
        >
          💬 Feedback
        </button>
      )}
    </div>
  );
}