import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getPlayerData, translations } from '@/lib/playerUtils';

export default function Security() {
  const navigate = useNavigate();
  const player = getPlayerData();
  const lang = player.language || 'pt';
  const t = translations[lang];

  const [privacy, setPrivacy] = React.useState(t.public);
  const [anonymous, setAnonymous] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const toggleSettings = (title: string) => {
    if (title === t.securityItems.privacy.title) {
        setPrivacy(prev => prev === t.public ? t.privateStatus : t.public);
    } else if (title === t.securityItems.anonymous.title) {
        setAnonymous(prev => !prev);
    } else if (title === t.securityItems.notifications.title) {
        setNotifications(prev => !prev);
    }
  };

  const securityItems = [
    {
      icon: <Lock size={20} className="text-[#00C896]" />,
      title: t.securityItems.privacy.title,
      description: t.securityItems.privacy.desc,
      status: privacy
    },
    {
      icon: <EyeOff size={20} className="text-amber-500" />,
      title: t.securityItems.anonymous.title,
      description: t.securityItems.anonymous.desc,
      status: anonymous ? t.activated : t.deactivated
    },
    {
      icon: <Bell size={20} className="text-purple-500" />,
      title: t.securityItems.notifications.title,
      description: t.securityItems.notifications.desc,
      status: notifications ? t.activated : t.deactivated
    }
  ];

  const isAllProtected = privacy === t.privateStatus && anonymous && notifications;

  return (
    <div className="h-screen flex flex-col relative" style={{ background: '#0D1B2A', color: '#E0E1DD' }}>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1B263B] border border-red-500/30 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black italic mb-2 text-red-500">{t.deleteModal.title}</h3>
            <p className="text-xs text-[#7A9BBF] mb-8 leading-relaxed">
              {t.deleteModal.description}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  localStorage.clear();
                  navigate('/');
                  window.location.reload();
                }}
                className="w-full py-4 bg-red-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg active:scale-95 transition-transform"
              >
                {t.deleteModal.confirm}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-[#162032] text-[#7A9BBF] font-black text-xs uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-transform"
              >
                {t.deleteModal.cancel}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <button onClick={() => navigate('/profile')} className="p-1" style={{ color: '#7A9BBF' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">{t.security}</h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-[#1B263B] rounded-3xl p-6 mb-8 text-center border border-[#2A4A6B]/30 shadow-xl">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border transition-colors ${
            isAllProtected ? 'bg-[#00C896]/10 border-[#00C896]/20' : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <ShieldCheck size={32} className={isAllProtected ? 'text-[#00C896]' : 'text-amber-500'} />
          </div>
          <h2 className={`text-xl font-black italic mb-1 ${isAllProtected ? 'text-[#00C896]' : 'text-amber-500'}`}>
            {isAllProtected ? t.securityStatus.protected : t.securityStatus.attention}
          </h2>
          <p className="text-xs text-[#7A9BBF]">
            {isAllProtected ? t.securityStatus.protectedDesc : t.securityStatus.attentionDesc}
          </p>
        </div>

        <h3 className="text-xs font-bold text-[#415A77] uppercase tracking-wider mb-4 px-2">{lang === 'en' ? 'Security Settings' : 'Configurações de Segurança'}</h3>
        
        <div className="space-y-3">
          {securityItems.map((item, index) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              onClick={() => toggleSettings(item.title)}
              className="w-full flex items-center gap-4 bg-[#1B263B] p-4 rounded-2xl border border-[#2A4A6B]/20 text-left active:bg-[#2A4A6B]/30 transition-all hover:border-[#00C896]/30 group"
            >
              <div className="p-2 bg-[#0D1B2A] rounded-xl group-hover:bg-[#00C896]/10 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-[10px] text-[#415A77] mt-0.5">{item.description}</p>
              </div>
              <div className="text-right">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                  item.status === t.activated || item.status === t.active || item.status === t.public || item.status === t.privateStatus || item.status === 'Ativado' || item.status === 'Ativo' ? 'text-[#00C896] bg-[#00C896]/10' : 'text-[#415A77] bg-[#0D1B2A]'
                }`}>
                  {item.status}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-red-400 text-xs font-black uppercase tracking-widest py-2 hover:bg-red-500/10 transition-colors rounded-xl"
            >
                {t.deleteAccount}
            </button>
        </div>
      </div>
    </div>
  );
}
