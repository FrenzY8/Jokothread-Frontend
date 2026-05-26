import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

function Messages() {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageCount, setImageCount] = useState(null);

  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsContactsLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND}/messages/contacts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setContacts(result.data);
        const searchParams = new URLSearchParams(location.search);
        const queryUserId = searchParams.get('userId');

        if (queryUserId) {
          const matchingContact = result.data.find(c => String(c.id) === String(queryUserId));
          if (matchingContact) {
            setActiveContact(matchingContact);
          } else {
            fetch(`${import.meta.env.VITE_BACKEND}/users/${queryUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(r => r.json())
              .then(resUser => {
                if (resUser.user) setActiveContact(resUser.user);
              }).catch(console.error);
          }
        }

      } catch (err) {
        toast.error("Gagal memuat kontak");
      } finally {
        setIsContactsLoading(false);
      }
    };
    if (token) fetchContacts();
  }, [token, location.search]);

  useEffect(() => {
    if (!activeContact) return;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND}/messages/${activeContact.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setMessages(result.data);

        const hasUnreadIncoming = result.data.some(
          msg => msg.sender_id === activeContact.id && msg.is_read === false
        );

        if (hasUnreadIncoming) {
          const readRes = await fetch(`${import.meta.env.VITE_BACKEND}/messages/${activeContact.id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (readRes.ok) {
            queryClient.invalidateQueries({ queryKey: ['unreadCounts', currentUser?.id] });
          }
        }

      } catch (err) {
        console.error("Gagal memuat chat:", err.message);
      }
    };

    fetchChatHistory();
    const interval = setInterval(fetchChatHistory, 3000);
    return () => clearInterval(interval);
  }, [activeContact, token, currentUser?.id, queryClient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Hanya file gambar!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImageCount(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageCount) return;

    try {
      setIsSending(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND}/messages/${activeContact.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage, attachment: imageCount })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setMessages(prev => [...prev, result.data]);
      setNewMessage("");
      setImageCount(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-2 md:px-4 pt-2 md:pt-4 h-[calc(100vh-70px)] md:h-[calc(100vh-100px)] flex gap-4 overflow-hidden">
      <div className={`w-full md:w-[300px] bg-[#182136]/50 border border-white/10 rounded-2xl flex flex-col overflow-hidden shrink-0
                ${activeContact ? 'hidden md:flex' : 'flex'}`}>

        <div className="p-4 border-b border-white/10">
          <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">forum</span> Obrolan
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isContactsLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-700/50" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-slate-700/50" />
                </div>
              </div>
            ))
          ) : contacts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center mt-6">Belum memfollow siapapun.</p>
          ) : (
            contacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                                    ${activeContact?.id === contact.id ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <img src={
                  contact.avatar ||
                  "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                } alt="avatar" className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                <div className="truncate flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">{contact.name}</h4>
                  <p className="text-xs text-slate-400 truncate">@{contact.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 bg-[#182136]/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden
                ${!activeContact ? 'hidden md:flex' : 'flex'}`}>

        {activeContact ? (
          <>
            <div className="p-3 md:p-4 bg-[#182136]/60 border-b border-white/10 flex items-center gap-3">
              <button
                onClick={() => setActiveContact(null)}
                className="md:hidden p-1 mr-1 text-slate-400 hover:text-white flex items-center justify-center rounded-lg bg-white/5"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>

              <Link to={`/profile/${activeContact.id}`} className="flex items-center gap-3 group cursor-pointer min-w-0 flex-1">
                <img src={
                  activeContact.avatar ||
                  "https://api.dicebear.com/7.x/bottts/svg?seed=guest"
                } alt="avatar" className="w-9 h-9 rounded-full object-cover group-hover:opacity-80 transition-opacity shrink-0" />

                <div className="truncate">
                  <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">{activeContact.name}</h3>
                  <p className="text-[11px] text-slate-400 truncate">@{activeContact.username}</p>
                </div>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {isChatLoading ? (
                <div className="text-center text-xs text-slate-500">Memuat obrolan...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-slate-500 my-auto">Kirim pesan pertama untuk memulai.</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`max-w-[85%] md:max-w-[70%] flex flex-col gap-1 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
                                                ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#182136] text-slate-200 rounded-bl-none border border-white/5'}`}>

                        {msg.attachment && (
                          <img src={msg.attachment} alt="Attachment" className="max-w-full max-h-[200px] rounded-lg mb-2 object-cover" />
                        )}
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-500 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-[#182136]/50 border-t border-white/10 flex flex-col gap-2">
              {imageCount && (
                <div className="relative w-16 h-16 border border-white/10 rounded-xl overflow-hidden bg-slate-900 group">
                  <img src={imageCount} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageCount(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-rose-500 text-[18px]">delete</span>
                  </button>
                </div>
              )}

              <div className="flex items-center pb-8 md:pb-0 gap-2">
                <label className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-slate-300 transition-colors flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 min-w-0"
                />

                <button
                  type="submit"
                  disabled={isSending || (!newMessage.trim() && !imageCount)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="my-auto text-center flex flex-col items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-[48px] text-slate-600">chat_bubble</span>
            <p className="text-sm">Pilih teman di sebelah kiri untuk mulai berkirim pesan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;  