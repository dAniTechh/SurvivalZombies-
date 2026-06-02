export function createStompClient(socket: any): any {
  // stompjs expone el constructor en el bundle 'stomp.js'
  const mod: any = require('stompjs/lib/stomp.js');
  return mod?.over ? mod.over(socket) : mod?.Stomp?.over?.(socket);
}


