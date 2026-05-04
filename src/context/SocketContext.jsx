import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3001', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('⚡ Socket connected');
    });
    socket.on('disconnect', () => setConnected(false));

    // New food posted nearby
    socket.on('new-food', (data) => {
      const notif = {
        id: Date.now(),
        type: 'new-food',
        message: `🍱 New food posted: "${data.title}"`,
        location: data.location,
        urgency: data.urgency,
        time: new Date(),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-fade-up' : 'opacity-0'} flex items-start gap-3 px-4 py-3 rounded-xl border border-green-500/30`}
            style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', maxWidth: 340 }}
          >
            <Bell size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">{notif.message}</p>
              <p className="text-white/50 text-xs mt-0.5">{data.location}</p>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    });

    // Food claimed
    socket.on('food-claimed', (data) => {
      const notif = {
        id: Date.now(),
        type: 'food-claimed',
        message: '✅ A food item has just been claimed',
        time: new Date(),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    });

    return () => socket.disconnect();
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, notifications, unreadCount, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
