<template>
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Relatório em Tempo Real</h1>

        <!-- Status Visual -->
        <div class="mb-4 p-4 rounded-lg" :class="statusClass">
            <div class="flex items-center">
                <div v-if="status === 'processing'" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <div v-else-if="status === 'done'" class="text-green-600 mr-2">✓</div>
                <div v-else-if="status === 'error'" class="text-red-600 mr-2">✗</div>
                <span class="font-medium">{{ statusText }}</span>
            </div>
        </div>

        <!-- Botão de Ação -->
        <button
            @click="startProcessing"
            :disabled="status === 'processing'"
            class="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            :class="buttonClass"
        >
            {{ buttonText }}
        </button>

        <!-- Log de Eventos -->
        <div v-if="events.length > 0" class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Eventos Recebidos:</h3>
            <div class="space-y-1 max-h-32 overflow-y-auto">
                <div
                    v-for="event in events"
                    :key="event.id"
                    class="text-xs p-2 bg-gray-50 rounded text-gray-600"
                >
                    <span class="font-medium">{{ event.time }}</span> - {{ event.message }}
                </div>
            </div>
        </div>

        <!-- Status de Conexão -->
        <div class="mt-4 text-xs text-gray-500">
            Conexão: <span :class="connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'">
                {{ connectionStatus }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import echo from '../echo'
import axios from 'axios'

// Estados reativos
const status = ref('idle')
const events = ref([])
const connectionStatus = ref('disconnected')
const reportId = ref(null)

// Computed properties para UI
const statusText = computed(() => {
    const statusMap = {
        idle: 'Aguardando',
        processing: 'Processando relatório...',
        done: 'Relatório concluído!',
        error: 'Erro no processamento'
    }
    return statusMap[status.value] || 'Status desconhecido'
})

const statusClass = computed(() => {
    const classMap = {
        idle: 'bg-gray-100 text-gray-700',
        processing: 'bg-blue-100 text-blue-700',
        done: 'bg-green-100 text-green-700',
        error: 'bg-red-100 text-red-700'
    }
    return classMap[status.value] || 'bg-gray-100 text-gray-700'
})

const buttonText = computed(() => {
    return status.value === 'processing' ? 'Processando...' : 'Processar Relatório'
})

const buttonClass = computed(() => {
    return status.value === 'processing'
        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700'
})

// Função para adicionar evento ao log
const addEvent = (message) => {
    events.value.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message
    })

    // Manter apenas os últimos 10 eventos
    if (events.value.length > 10) {
        events.value = events.value.slice(0, 10)
    }
}

// Configuração do Echo e listeners
onMounted(() => {
    // Listener para eventos de relatório processado
    const channel = echo.channel('Processed.Report')

    channel.listen('ProcessedReport', (data) => {
        console.log('Evento ProcessedReport recebido:', data)
        status.value = 'done'
        addEvent(`Relatório ${data.report?.id || 'N/A'} processado com sucesso`)
    })

    // Listener para eventos de progresso (opcional)
    channel.listen('ReportProgress', (data) => {
        console.log('Progresso do relatório:', data)
        addEvent(`Progresso: ${data.progress || 0}%`)
    })

    // Listener para eventos de erro (opcional)
    channel.listen('ReportError', (data) => {
        console.log('Erro no relatório:', data)
        status.value = 'error'
        addEvent(`Erro: ${data.message || 'Erro desconhecido'}`)
    })

    // Status da conexão
    echo.connector.pusher.connection.bind('connected', () => {
        connectionStatus.value = 'connected'
        addEvent('Conectado ao WebSocket')
    })

    echo.connector.pusher.connection.bind('disconnected', () => {
        connectionStatus.value = 'disconnected'
        addEvent('Desconectado do WebSocket')
    })

    echo.connector.pusher.connection.bind('error', (error) => {
        connectionStatus.value = 'error'
        addEvent(`Erro de conexão: ${error.message || 'Erro desconhecido'}`)
    })

    addEvent('Componente inicializado')
})

// Limpeza dos listeners
onUnmounted(() => {
    echo.leaveChannel('Processed.Report')
})

// Função para iniciar o processamento
const startProcessing = async () => {
    try {
        status.value = 'processing'
        addEvent('Iniciando processamento...')

        const response = await axios.post(
            import.meta.env.VITE_API_BASE_URL + '/api/reports/process',
            {
                title: 'Relatório Automático',
                // Adicione outros dados necessários aqui
            }
        )

        if (response.data.report_id) {
            reportId.value = response.data.report_id
            addEvent(`Relatório ${response.data.report_id} enviado para processamento`)
        }

    } catch (error) {
        status.value = 'error'
        addEvent(`Erro na requisição: ${error.message}`)
        console.error('Erro ao processar relatório:', error)
    }
}
</script>
