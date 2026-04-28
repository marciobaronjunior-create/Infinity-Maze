import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Camera, Shield, Award, ChevronRight, ShoppingBag, Coins } from 'lucide-react';
import { getPlayerData, updatePlayerData, translations } from '@/lib/playerUtils';
import { motion } from 'motion/react';

export default function Profile() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(getPlayerData());
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(player.nickname);

  const lang = player.language || 'pt';
  const t = translations[lang];

  const handleSave = () => {
    if (player.nicknameChanged) {
        alert(lang === 'en' ? 'You already changed your nickname once!' : 'Você já alterou seu apelido uma vez!');
        setIsEditing(false);
        return;
    }
    const updated = updatePlayerData({ nickname, nicknameChanged: true });
    setPlayer(updated);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updated = updatePlayerData({ customAvatar: base64String });
        setPlayer(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const changeAvatar = (avatar: string) => {
    const updated = updatePlayerData({ avatar, customAvatar: undefined });
    setPlayer(updated);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0D1B2A', color: '#E0E1DD' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <button onClick={() => navigate('/')} className="p-1" style={{ color: '#7A9BBF' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">{t.profile.title}</h1>
        <div className="flex items-center gap-1 bg-[#1B263B] px-3 py-1 rounded-full border border-[#2A4A6B]">
            <Coins size={12} className="text-yellow-500" />
            <span className="text-xs font-bold">{player.coins}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Profile Card */}
        <div className="p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-[#1B263B] rounded-full flex items-center justify-center text-5xl border-4 border-[#2A4A6B] shadow-2xl overflow-hidden">
              {player.customAvatar ? (
                <img src={player.customAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                player.avatar
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-[#00C896] text-[#0D1B2A] rounded-full shadow-lg border-4 border-[#0D1B2A] cursor-pointer active:scale-90 transition-transform">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="text-center w-full max-w-xs px-4">
            {isEditing ? (
              <div className="flex flex-col items-center gap-3">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-[#1B263B] border border-[#2A4A6B] rounded-xl px-4 py-2 text-center font-bold text-xl outline-none focus:border-[#00C896] transition-colors"
                  autoFocus
                />
                <button 
                  onClick={handleSave}
                  className="bg-[#00C896] text-[#0D1B2A] px-8 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                >
                  {t.profile.save}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                  {player.nickname}
                  {!player.nicknameChanged && (
                    <button onClick={() => setIsEditing(true)} className="p-1 text-[#415A77] hover:text-[#00C896] transition-colors">
                      <Pencil size={16} />
                    </button>
                  )}
                </h2>
                <p className="text-[#00C896] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">{lang === 'en' ? 'Explorer Level' : 'Explorador Nível'} {player.level}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => navigate('/missions')}
              className="bg-[#1B263B] p-4 rounded-3xl border border-[#2A4A6B]/30 flex items-center gap-3 active:scale-95 transition-transform text-left"
            >
                <Shield size={20} className="text-[#7A9BBF]" />
                <div>
                    <p className="text-[10px] text-[#415A77] font-bold uppercase">{t.missions}</p>
                    <p className="font-bold">{lang === 'en' ? '4 Active' : '4 Ativas'}</p>
                </div>
            </button>
            <button 
              onClick={() => navigate('/achievements')}
              className="bg-[#1B263B] p-4 rounded-3xl border border-[#2A4A6B]/30 flex items-center gap-3 active:scale-95 transition-transform text-left"
            >
                <Award size={20} className="text-yellow-500" />
                <div>
                    <p className="text-[10px] text-[#415A77] font-bold uppercase">{t.achievements}</p>
                    <p className="font-bold">2/4</p>
                </div>
            </button>
        </div>

        {/* Tabs: Avatars, Skins, Store */}
        <div className="px-6 mb-8 mt-4 space-y-6">
          {/* Avatars Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[10px] font-bold text-[#415A77] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-[#00C896] rounded-full" />
                {t.profile.avatars}
              </h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {player.unlockedAvatars.slice(0, 1).map(av => (
                <button
                  key={av}
                  onClick={() => changeAvatar(av)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 ${(!player.customAvatar && player.avatar === av) ? 'bg-[#00C896] text-[#0D1B2A] ring-2 ring-[#00C896] ring-offset-2 ring-offset-[#0D1B2A]' : 'bg-[#1B263B] text-[#7A9BBF] opacity-60'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Skins Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[10px] font-bold text-[#415A77] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-purple-500 rounded-full" />
                {t.profile.skins}
              </h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {player.unlockedSkins.map(skin => (
                <button
                  key={skin}
                  onClick={() => updatePlayerData({ mazeSkin: skin })}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 ${player.mazeSkin === skin ? 'bg-purple-500 text-white ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0D1B2A]' : 'bg-[#1B263B] text-[#7A9BBF] opacity-60'}`}
                >
                  {skin}
                </button>
              ))}
            </div>
          </div>

          {/* Store CTA */}
          <button 
            onClick={() => navigate('/store')}
            className="w-full bg-[#0D1B2A] border-2 border-dashed border-[#2A4A6B]/30 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00C896]/10 rounded-xl flex items-center justify-center text-[#00C896]">
                <ShoppingBag size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white uppercase tracking-tight">{t.store.title}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#415A77] group-hover:text-[#00C896] transition-colors" />
          </button>
        </div>

        {/* Menu Extras */}
        <div className="px-6 mb-12 space-y-2">
            <button 
                onClick={() => navigate('/security')}
                className="w-full flex items-center justify-between p-4 bg-[#1B263B] rounded-2xl text-xs font-bold text-[#7A9BBF] active:bg-[#2A4A6B]/50 transition-colors"
            >
                <span className="flex items-center gap-3">
                    <Shield size={16} /> {t.security}
                </span>
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
}
