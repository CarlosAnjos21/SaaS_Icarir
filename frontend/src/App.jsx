// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components (Componentes Menores/Reutilizáveis)
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import MissaoDetalhes from "./components/MissaoDetalhes"; // <--- NOVO IMPORT

// Pages (Páginas de Rota Principal)
import Home from "./pages/Home";
import Admin from "./pages/Admin"; // <--- Sua página de Administrador (que renderiza o AdminPanel desmembrado)
import Register from "./pages/Register";
/* import Feedbacks from "./pages/Feedbacks"; */
import Missions from "./pages/Missions";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Trips from "./pages/Trips";
import Logout from "./pages/Logout";
import CareerPanel from "./pages/CareerPanel";
import Sorteio from "./pages/RafflePage";

export default function App() {
  return (
    <Router>
      <div className="bg-white text-dark min-h-screen">
        <Navbar />
        <Routes>
          
          {/* 🏡 Rotas Principais / Usuário Comum */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* 🗺️ Rotas de Conteúdo/Gamificação */}
          <Route path="/missions" element={<Missions />} />
          {/* Rota Detalhes da Missão - Usando Componente, não Página */}
          {/* Sugestão: A rota de detalhes deve ter um parâmetro (ID) */}
          <Route path="/missao/:id" element={<MissaoDetalhes />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/carreira" element={<CareerPanel />} />
          <Route path="/sorteio" element={<Sorteio />} />
          {/* <Route path="/feedbacks" element={<Feedbacks />} /> */}

          {/* 🔑 Rota do Painel de Administração (USA O CÓDIGO DESMEMBRADO) */}
          <Route path="/admin" element={<Admin />} />

        </Routes>
      </div>
    </Router>
  );
}