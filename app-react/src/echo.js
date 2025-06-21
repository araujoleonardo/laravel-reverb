import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Reverb usa protocolo Pusher
window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'mt1',
  enableStats: false,
  enableLogging: import.meta.env.DEV
});

export default echo;
