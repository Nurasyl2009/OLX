import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ArrowLeft, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getChatHistory, sendMessage, getUsersList } from '../services/api';

const Chat = () => {
  const { user, socket } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg) => {
        // If message is from currently selected user, add to messages list
        if (selectedUser && (msg.sender_id === selectedUser.id || msg.receiver_id === selectedUser.id)) {
          setMessages(prev => [...prev, msg]);
        }
        // Refresh conversations list to update preview/unread count
        fetchConversations();
      };

      socket.on('new_message', handleNewMessage);
      return () => socket.off('new_message', handleNewMessage);
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchChat(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) { console.error(err); }
    finally { setLoadingConvos(false); }
  };

  const fetchChat = async (userId) => {
    try {
      const data = await getChatHistory(userId);
      setMessages(data);
    } catch (err) { console.error(err); }
    finally { setLoadingChat(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser || sending) return;
    setSending(true);
    try {
      const sentMsg = await sendMessage(selectedUser.id, newMsg.trim());
      setNewMsg('');
      setMessages(prev => [...prev, sentMsg]);
      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.error || 'Хабарлама жіберу қатесі');
    } finally { setSending(false); }
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    try {
      const users = await getUsersList();
      setAllUsers(users);
    } catch (err) { console.error(err); }
  };

  const selectNewUser = (u) => {
    setSelectedUser({ id: u.id, name: u.name });
    setShowNewChat(false);
    setLoadingChat(true);
    setUserSearch('');
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const charCount = newMsg.length;

  if (!user) return <div className="chat-page"><p>Жүйеге кіріңіз</p></div>;

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Sidebar */}
        <div className={`chat-sidebar ${selectedUser ? 'hide-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <Link to="/" className="notif-back-btn"><ArrowLeft size={20} /></Link>
            <h2><MessageSquare size={22} /> Чат</h2>
            <button className="chat-new-btn" onClick={openNewChat} title="Жаңа чат">
              <Users size={18} />
            </button>
          </div>

          {showNewChat && (
            <div className="chat-new-panel">
              <div className="chat-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Пайдаланушыны іздеу..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="chat-user-list">
                {filteredUsers.map(u => (
                  <button key={u.id} className="chat-user-item" onClick={() => selectNewUser(u)}>
                    <div className="chat-avatar">{u.name[0]}</div>
                    <div>
                      <p className="chat-user-name">{u.name}</p>
                      <span className="chat-user-role">{u.role}</span>
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && <p className="chat-empty-text">Пайдаланушы табылмады</p>}
              </div>
            </div>
          )}

          <div className="chat-convo-list">
            {loadingConvos ? (
              <div className="chat-loading"><div className="notif-spinner"></div></div>
            ) : conversations.length === 0 ? (
              <div className="chat-empty">
                <MessageSquare size={32} strokeWidth={1} />
                <p>Әзірше чат жоқ</p>
                <button className="chat-start-btn" onClick={openNewChat}>Жаңа чат бастау</button>
              </div>
            ) : (
              conversations.map(c => (
                <button
                  key={c.other_id}
                  className={`chat-convo-item ${selectedUser?.id === c.other_id ? 'active' : ''}`}
                  onClick={() => { setSelectedUser({ id: c.other_id, name: c.other_name }); setLoadingChat(true); }}
                >
                  <div className="chat-avatar">{c.other_name[0]}</div>
                  <div className="chat-convo-info">
                    <div className="chat-convo-top">
                      <span className="chat-convo-name">{c.other_name}</span>
                      <span className="chat-convo-time">{formatTime(c.last_time)}</span>
                    </div>
                    <p className="chat-convo-preview">{c.last_message}</p>
                  </div>
                  {c.unread_count > 0 && <span className="chat-unread-badge">{c.unread_count}</span>}
                </button>
              ))
            )}
          </div>
        </div>
        <div className={`chat-main ${!selectedUser ? 'hide-mobile' : ''}`}>
          {selectedUser ? (
            <>
              <div className="chat-main-header">
                <button className="chat-back-mobile" onClick={() => setSelectedUser(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-avatar">{selectedUser.name[0]}</div>
                <div>
                  <h3 className="chat-partner-name">{selectedUser.name}</h3>
                  <span className="chat-online-status">Желіде</span>
                </div>
              </div>

              <div className="chat-messages">
                {loadingChat ? (
                  <div className="chat-loading"><div className="notif-spinner"></div></div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-msg">
                    <p>💬 Хабарлама жоқ. Бірінші болып жазыңыз!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`chat-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                      <p className="chat-bubble-text">{msg.message_text}</p>
                      <span className="chat-bubble-time">
                        {new Date(msg.created_at).toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty' })}
                        {msg.sender_id === user.id && (
                          <span className="chat-read-status">{msg.is_read ? ' ✓✓' : ' ✓'}</span>
                        )}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Хабарлама жазыңыз..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  maxLength={2000}
                />
                <div className="chat-input-actions">
                  <span className={`chat-char-count ${charCount > 1800 ? 'warn' : ''}`}>{charCount}/2000</span>
                  <button type="submit" className="chat-send-btn" disabled={!newMsg.trim() || sending}>
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="chat-no-selection">
              <MessageSquare size={64} strokeWidth={1} />
              <h3>Чатты таңдаңыз</h3>
              <p>Сол жақтағы тізімнен чат таңдаңыз немесе жаңа чат бастаңыз</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty' });
  if (diff < 604800000) return d.toLocaleDateString('kk-KZ', { weekday: 'short', timeZone: 'Asia/Almaty' });
  return d.toLocaleDateString('kk-KZ', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Almaty' });
}

export default Chat;
