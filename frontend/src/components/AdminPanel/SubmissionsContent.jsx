import React, { useState, useEffect, useCallback } from "react";
import {
  Loader,
  AlertCircle,
  CheckCircle,
  X,
  User,
  FileText,
  Camera,
  ListChecks,
  Clock,
  ExternalLink,
  Award,
  Inbox,
} from "lucide-react";

import api from "../../api/api";

// ===================================================================
// CARD DE UMA SUBMISSÃO PENDENTE
// ===================================================================

const SubmissionCard = ({ submission, onValidate }) => {
  const [pontos, setPontos] = useState(submission.tarefa?.pontos || 0);
  const [processing, setProcessing] = useState(false);

  const evidencias = submission.evidencias || {};
  const tipo = evidencias.type;

  const handleAction = async (approve) => {
    if (approve && !window.confirm(`Aprovar e conceder ${pontos} pontos?`))
      return;
    if (!approve && !window.confirm("Reprovar esta submissão?")) return;

    setProcessing(true);
    try {
      await onValidate(submission.id, approve, approve ? Number(pontos) : 0);
    } finally {
      setProcessing(false);
    }
  };

  const renderEvidence = () => {
    if (tipo === "document" && evidencias.fileName) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">
          <FileText size={16} className="text-orange-500 flex-shrink-0" />
          <span className="truncate">{evidencias.fileName}</span>
        </div>
      );
    }
    if (tipo === "social" && evidencias.link) {
      return (
        <a
          href={evidencias.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 rounded-lg p-3 mt-2 hover:bg-purple-100 transition-colors"
        >
          <Camera size={16} className="flex-shrink-0" />
          <span className="truncate underline">{evidencias.link}</span>
          <ExternalLink size={14} className="flex-shrink-0 ml-auto" />
        </a>
      );
    }
    if (tipo === "quiz" && evidencias.answers) {
      return (
        <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg p-3 mt-2">
          <ListChecks size={16} className="flex-shrink-0" />
          <span>
            {Object.keys(evidencias.answers).length} resposta(s) enviada(s)
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-2">
        <Inbox size={16} className="flex-shrink-0" />
        <span>
          Sem evidência estruturada — verifique os detalhes da tarefa.
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            {submission.usuario?.foto_url ? (
              <img
                src={submission.usuario.foto_url}
                alt={submission.usuario?.nome}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User size={18} className="text-gray-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {submission.usuario?.nome || "Usuário"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {submission.tarefa?.titulo || "Tarefa"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <Clock size={12} />
              {submission.data_criacao
                ? new Date(submission.data_criacao).toLocaleString("pt-BR")
                : "—"}
            </div>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 whitespace-nowrap">
          PENDENTE
        </span>
      </div>

      {renderEvidence()}

      <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-orange-500" />
          <label className="text-xs text-gray-500 font-bold uppercase">
            Pontos
          </label>
          <input
            type="number"
            min="0"
            value={pontos}
            onChange={(e) => setPontos(e.target.value)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394C97] outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction(false)}
            disabled={processing}
            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <X size={16} /> Reprovar
          </button>
          <button
            onClick={() => handleAction(true)}
            disabled={processing}
            className="px-4 py-2 text-sm font-bold text-white bg-[#394C97] hover:bg-blue-900 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {processing ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <CheckCircle size={16} />
            )}{" "}
            Aprovar
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// PÁGINA PRINCIPAL
// ===================================================================

export default function SubmissionsContent() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/submissions/pending");
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar submissões pendentes:", err);
      setError("Não foi possível carregar as submissões pendentes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleValidate = async (submissionId, approve, pontos_concedidos) => {
    try {
      await api.post(`/admin/submissions/${submissionId}/validate`, {
        approve,
        pontos_concedidos,
      });
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (err) {
      alert(err?.response?.data?.error || "Erro ao validar submissão.");
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <Loader className="animate-spin mx-auto text-[#394C97] mb-2" />
        Carregando submissões...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        <AlertCircle className="mx-auto mb-2" />
        {error}
        <br />
        <button onClick={fetchPending} className="mt-4 underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Submissões pendentes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tarefas aguardando validação manual
          </p>
        </div>
        <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
          {submissions.length} pendente{submissions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
          <CheckCircle size={32} className="mx-auto mb-2 text-gray-300" />
          <p>Nenhuma submissão pendente no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onValidate={handleValidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
