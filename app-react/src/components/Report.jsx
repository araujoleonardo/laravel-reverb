import React, { useEffect, useState, useCallback } from 'react';
import echo from '../echo'; // o mesmo que você usa no Vue
import axios from 'axios';

export default function Report() {
  const [status, setStatus] = useState('idle');
  const [events, setEvents] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reportId, setReportId] = useState(null);

  const statusText = {
    idle: 'Aguardando',
    processing: 'Processando relatório...',
    done: 'Relatório concluído!',
    error: 'Erro no processamento',
  }[status] || 'Status desconhecido';

  const statusClass = {
    idle: 'bg-gray-100 text-gray-700',
    processing: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-700';

  const buttonText = status === 'processing' ? 'Processando...' : 'Processar Relatório';
  const buttonClass =
    status === 'processing'
      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
      : 'bg-blue-600 text-white hover:bg-blue-700';

  const addEvent = useCallback((message) => {
    setEvents((prevEvents) => {
      const newEvent = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message,
      };
      const updated = [newEvent, ...prevEvents];
      return updated.slice(0, 10);
    });
  }, []);

  useEffect(() => {
    addEvent('Componente inicializado');

    const channel = echo.channel('Processed.Report');

    channel.listen('ProcessedReport', (data) => {
      console.log('Evento ProcessedReport recebido:', data);
      setStatus('done');
      addEvent(`Relatório ${data.report?.id || 'N/A'} processado com sucesso`);
    });

    channel.listen('ReportProgress', (data) => {
      console.log('Progresso do relatório:', data);
      addEvent(`Progresso: ${data.progress || 0}%`);
    });

    channel.listen('ReportError', (data) => {
      console.log('Erro no relatório:', data);
      setStatus('error');
      addEvent(`Erro: ${data.message || 'Erro desconhecido'}`);
    });

    // Eventos de conexão
    echo.connector.pusher.connection.bind('connected', () => {
      setConnectionStatus('connected');
      addEvent('Conectado ao WebSocket');
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      setConnectionStatus('disconnected');
      addEvent('Desconectado do WebSocket');
    });

    echo.connector.pusher.connection.bind('error', (error) => {
      setConnectionStatus('error');
      addEvent(`Erro de conexão: ${error.message || 'Erro desconhecido'}`);
    });

    return () => {
      echo.leaveChannel('Processed.Report');
    };
  }, [addEvent]);

  const startProcessing = async () => {
    try {
      setStatus('processing');
      addEvent('Iniciando processamento...');

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reports/process`,
        {
          title: 'Relatório Automático',
        }
      );

      if (response.data.report_id) {
        setReportId(response.data.report_id);
        addEvent(`Relatório ${response.data.report_id} enviado para processamento`);
      }
    } catch (error) {
      setStatus('error');
      addEvent(`Erro na requisição: ${error.message}`);
      console.error('Erro ao processar relatório:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Relatório em Tempo Real</h1>

      {/* Status Visual */}
      <div className={`mb-4 p-4 rounded-lg ${statusClass}`}>
        <div className="flex items-center">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {status === 'done' && <div className="text-green-600 mr-2">✓</div>}
          {status === 'error' && <div className="text-red-600 mr-2">✗</div>}
          <span className="font-medium">{statusText}</span>
        </div>
      </div>

      {/* Botão de Ação */}
      <button
        onClick={startProcessing}
        disabled={status === 'processing'}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${buttonClass}`}
      >
        {buttonText}
      </button>

      {/* Log de Eventos */}
      {events.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Eventos Recebidos:</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="text-xs p-2 bg-gray-50 rounded text-gray-600">
                <span className="font-medium">{event.time}</span> - {event.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status de Conexão */}
      <div className="mt-4 text-xs text-gray-500">
        Conexão:{' '}
        <span
          className={
            connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
          }
        >
          {connectionStatus}
        </span>
      </div>
    </div>
  );
}
