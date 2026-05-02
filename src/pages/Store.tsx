import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Coins, Check, Pencil, Star, ShieldAlert } from 'lucide-react';
import { getPlayerData, updatePlayerData, translations } from '@/lib/playerUtils';
import { motion } from 'motion/react';
import { createCheckoutSession } from '@/services/stripeService';

interface Skin {
  id: string;
  emoji: string;
  name: string;
  price: number;
  priceBRL?: string;
  minLevel?: number;
}

const SKINS_BASE: Omit<Skin, 'name'>[] = [
  { id: '0', emoji: '🏈', price: 0, minLevel: 3, nameKey: 'bowlMaster' },
  { id: '1', emoji: '👻', price: 100, minLevel: 2, nameKey: 'fantasmao' },
  { id: '5', emoji: '🧟', price: 100, nameKey: 'zumbi' },
  { id: '3', emoji: '🦸', price: 200, nameKey: 'heroi' },
  { id: '4', emoji: '🧛', price: 0, priceBRL: 'R$ 2,99', nameKey: 'vampiro' },
  { id: '7', emoji: '🧜‍♀️', price: 350, nameKey: 'sereia' },
  { id: '8', emoji: '8', price: 0, priceBRL: 'R$ 2,99', nameKey: 'unicornio' },
  { id: '9', emoji: '🐉', price: 1000, nameKey: 'dragao' },
  { id: '10', emoji: '🌌', price: 2000, nameKey: 'cosmos' },
].sort((a, b) => {
  if (a.priceBRL && !b.priceBRL) return -1;
  if (!a.priceBRL && b.priceBRL) return 1;
  return a.price - b.price;
}) as any;

export default function Store() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(getPlayerData());
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [storeError, setStoreError] = useState<string | null>(null);

  const lang = player.language || 'pt';
  const t = translations[lang];

  const isPremiumActive = player.premiumUntil ? player.premiumUntil > Date.now() : false;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const pending = localStorage.getItem('pending_purchase');
      
      if (pending === 'no_ads') {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const updated = updatePlayerData({ premiumUntil: Date.now() + thirtyDays });
        setPlayer(updated);
      } else if (pending === 'nickname_reset') {
        const updated = updatePlayerData({ nicknameChanged: false });
        setPlayer(updated);
      } else if (pending?.startsWith('skin:')) {
        const skinEmoji = pending.split(':')[1];
        if (!player.unlockedSkins.includes(skinEmoji)) {
          const updated = updatePlayerData({ 
            unlockedSkins: [...player.unlockedSkins, skinEmoji],
            mazeSkin: skinEmoji 
          });
          setPlayer(updated);
        }
      }
      
      localStorage.removeItem('pending_purchase');
      alert(lang === 'en' ? 'Payment successful! Your item has been unlocked.' : 'Pagamento realizado com sucesso! Seu item foi desbloqueado.');
      
      window.history.replaceState({}, '', '/store');
    } else if (params.get('canceled') === 'true') {
      alert(lang === 'en' ? 'Payment canceled.' : 'Pagamento cancelado.');
      window.history.replaceState({}, '', '/store');
    }
  }, [lang]);

  const formatPrice = (price: string | undefined) => {
    if (!price) return price;
    if (lang === 'en') {
      return price.replace('R$', 'US $');
    }
    return price;
  };

  const buySkin = async (skin: any) => {
    setStoreError(null);
    console.log('[Store] Clicking buySkin:', skin.id);
    if (skin.minLevel && player.level < skin.minLevel) return;
    if (!skin.priceBRL && player.coins < skin.price) return;
    if (player.unlockedSkins.includes(skin.emoji)) return;

    if (skin.priceBRL) {
      const skinName = (t.skinsData as any)[skin.nameKey];
      const displayPrice = formatPrice(skin.priceBRL);
      const confirmPay = window.confirm(lang === 'en' ? `Buy ${skinName} for ${displayPrice}?` : `Comprar ${skinName} por ${displayPrice}?`);
      if (!confirmPay) return;

      try {
        console.log('[Store] Initiating Stripe session for skin', skin.id);
        setBuyingId(skin.id);
        
        // Convert 'R$ 2,99' -> '2.99'
        const rawPriceValue = skin.priceBRL.replace(/[^\d.,]/g, '').replace(',', '.');
        const amountInCents = Math.round(parseFloat(rawPriceValue) * 100);
        
        if (isNaN(amountInCents) || amountInCents <= 0) {
          throw new Error(`Invalid price detected: ${skin.priceBRL}`);
        }

        const url = await createCheckoutSession([{
          name: skinName,
          description: `Skin ${skinName} for Infinity Maze`,
          amount: amountInCents
        }], lang === 'pt' ? 'brl' : 'usd');
        
        if (url) {
          console.log('[Store] Redirecting to Stripe URL:', url);
          localStorage.setItem('pending_purchase', `skin:${skin.emoji}`);
          window.location.assign(url);
          return;
        } else {
          throw new Error("Stripe server did not return a checkout URL.");
        }
      } catch (error: any) {
        console.error('[Store] Detailed Stripe redirect error:', error);
        setStoreError(`${lang === 'en' ? 'Stripe Error:' : 'Erro do Stripe:'} ${error.message}`);
        setBuyingId(null);
        return;
      }
    }

    // Apenas chega aqui se NÃO for uma skin paga (apenas coins ou coins insuficiente)
    console.log('[Store] Falling back to coin purchase or simulation');
    setBuyingId(skin.id);
    
    // Simular delay de compra/pagamento
    setTimeout(() => {
      const updated = updatePlayerData({
        coins: skin.priceBRL ? player.coins : player.coins - skin.price,
        unlockedSkins: [...player.unlockedSkins, skin.emoji],
        mazeSkin: skin.emoji 
      });
      setPlayer(updated);
      setBuyingId(null);
    }, 800);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0D1B2A', color: '#E0E1DD' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b" style={{ background: '#162032', borderColor: '#2A4A6B' }}>
        <button onClick={() => navigate('/profile')} className="p-1" style={{ color: '#7A9BBF' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">{t.store.title}</h1>
        <div className="flex items-center gap-1 bg-[#1B263B] px-3 py-1 rounded-full border border-[#2A4A6B]">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-xs font-bold">{player.coins}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {storeError && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl text-xs mb-6 flex flex-col gap-2">
            <div className="font-bold flex items-center gap-2">
              <ShieldAlert size={14} /> ERROR
            </div>
            <p>{storeError}</p>
            <button 
              onClick={() => setStoreError(null)}
              className="text-[10px] underline self-end uppercase font-bold tracking-tighter"
            >
              Dismiss
            </button>
          </div>
        )}

        {stripeStatus && (
          <div className="bg-[#0D1B2A] border border-[#415A77]/30 p-4 rounded-2xl text-[10px] mb-6 text-[#7A9BBF] font-mono whitespace-pre shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#00C896] font-bold">STRIPE_DIAGNOSTICS</span>
              <button onClick={() => setStripeStatus(null)} className="text-red-400">CLOSE</button>
            </div>
            <div>SK: {stripeStatus.stripe_secret_key.detected ? 'DETECTED' : 'MISSING'} ({stripeStatus.stripe_secret_key.mode})</div>
            <div>PK: {stripeStatus.stripe_public_key.detected ? 'DETECTED' : 'MISSING'} ({stripeStatus.stripe_public_key.mode})</div>
            <div>WH: {stripeStatus.stripe_webhook_secret.detected ? 'DETECTED' : 'MISSING'} {stripeStatus.stripe_webhook_secret.detected && !stripeStatus.stripe_webhook_secret.valid_prefix && (
              <span className="text-red-500 font-bold ml-1">!!! PREFIX ERROR (Must start with whsec_) !!! Received: "{stripeStatus.stripe_webhook_secret.prefix_received}"</span>
            )}</div>
            <div className="mt-2 text-[8px] opacity-70">Timestamp: {stripeStatus.timestamp}</div>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <button 
            onClick={async () => {
              setStoreError(null);
              try {
                setBuyingId('checking_status');
                const res = await fetch('/api/health');
                const data = await res.json();
                setStripeStatus(data);
                setBuyingId(null);
              } catch (e: any) {
                setStoreError("Failed to connect to backend: " + e.message);
                setBuyingId(null);
              }
            }}
            className="text-[10px] text-white bg-[#415A77]/30 border border-[#415A77]/50 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-[#415A77]/50 transition-all flex items-center gap-2"
          >
            {buyingId === 'checking_status' ? 'Checking...' : 'Check Stripe Status'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(SKINS_BASE as any[]).map((skin, index) => {
            const isUnlocked = player.unlockedSkins.includes(skin.emoji);
            const canAfford = skin.priceBRL ? true : player.coins >= skin.price;
            const isLevelLocked = skin.minLevel ? player.level < skin.minLevel : false;
            const isEquipped = player.mazeSkin === skin.emoji;
            const skinName = (t.skinsData as any)[skin.nameKey];

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={skin.id}
                className={`flex flex-col items-center p-4 rounded-3xl border transition-all ${
                  isEquipped ? 'bg-[#00C896]/10 border-[#00C896]' : 'bg-[#1B263B] border-[#2A4A6B]/30'
                } ${isLevelLocked && !isUnlocked ? 'opacity-70 grayscale' : ''}`}
              >
                <div className="text-4xl mb-3 h-16 w-16 flex items-center justify-center bg-[#0D1B2A] rounded-2xl shadow-inner relative overflow-hidden">
                  {skin.emoji.startsWith('/') ? (
                    <img src={skin.emoji} alt={skinName} className="w-[80%] h-[80%] object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    skin.emoji
                  )}
                  {isLevelLocked && !isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0D1B2A]/80 rounded-2xl">
                      <span className="text-[10px] font-black text-red-400 text-center px-1 uppercase">{t.profile.locked} {skin.minLevel}</span>
                    </div>
                  )}
                  {skin.priceBRL && !isUnlocked && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-purple-400">
                      PREMIUM
                    </div>
                  )}
                </div>
                <h3 className="text-[10px] font-bold text-[#7A9BBF] uppercase tracking-wider mb-1">{skinName}</h3>
                
                {isUnlocked ? (
                  <button 
                    onClick={() => {
                        const updated = updatePlayerData({ mazeSkin: skin.emoji });
                        setPlayer(updated);
                    }}
                    className={`mt-2 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      isEquipped ? 'bg-[#00C896] text-[#0D1B2A]' : 'bg-[#2A4A6B] text-[#E0E1DD]'
                    }`}
                  >
                    {isEquipped ? t.profile.equipped : t.profile.equip}
                  </button>
                ) : (
                  <button
                    disabled={(!canAfford && skin.price > 0 && !skin.priceBRL) || isLevelLocked || buyingId !== null}
                    onClick={() => buySkin(skin)}
                    className={`mt-2 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      isLevelLocked 
                        ? 'bg-[#0D1B2A] text-[#415A77] border border-dashed border-[#2A4A6B]'
                        : skin.priceBRL
                          ? 'bg-purple-600 text-white shadow-[0_4px_0_#4C1D95] active:shadow-none active:translate-y-[4px]'
                          : canAfford || skin.price === 0
                            ? 'bg-yellow-500 text-[#0D1B2A] shadow-[0_4px_0_#B45309] active:shadow-none active:translate-y-[4px]' 
                            : 'bg-gray-700 text-gray-500 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {buyingId === skin.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <ShoppingBag size={12} />
                      </motion.div>
                    ) : isLevelLocked ? (
                      t.profile.locked
                    ) : skin.priceBRL ? (
                      formatPrice(skin.priceBRL)
                    ) : skin.price === 0 ? (
                      t.claim
                    ) : (
                      <>
                        <Coins size={12} /> {skin.price}
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Special Services */}
        <div className="mt-10 space-y-4">
          <h2 className="text-xs font-bold text-[#415A77] uppercase tracking-[0.2em] mb-4 border-l-2 border-[#00C896] pl-3">{t.specialServices}</h2>
          
          <div className="bg-[#1B263B] border border-[#2A4A6B]/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Star size={28} />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight">{t.removeAds}</h3>
                <p className="text-[10px] text-[#7A9BBF] uppercase font-bold mt-0.5">{t.removeAdsDesc}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                console.log('[Store] Clicking Premium button');
                const servicePrice = 'R$ 9,99';
                const confirmPay = window.confirm(lang === 'en' ? `Buy ${t.removeAds} for ${formatPrice(servicePrice)}?` : `Comprar ${t.removeAds} por ${formatPrice(servicePrice)}?`);
                if (confirmPay) {
                  try {
                    console.log('[Store] Initiating Stripe session for Premium');
                    setBuyingId('no_ads');
                    const url = await createCheckoutSession([{
                      name: t.removeAds,
                      description: t.removeAdsDesc,
                      amount: 999
                    }], lang === 'pt' ? 'brl' : 'usd');
                    if (url) {
                      console.log('[Store] Redirecting to Stripe:', url);
                      localStorage.setItem('pending_purchase', 'no_ads');
                      window.location.href = url;
                      return;
                    }
                  } catch (error: any) {
                    console.error('[Store] Stripe redirect failed:', error);
                    setStoreError(`${lang === 'en' ? 'Stripe Error:' : 'Erro do Stripe:'} ${error.message}`);
                    setBuyingId(null);
                    return;
                  }
                }
              }}
              disabled={buyingId === 'no_ads' || isPremiumActive}
              className={`px-5 py-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 ${
                isPremiumActive 
                  ? 'bg-[#00C896]/20 text-[#00C896] border border-[#00C896]'
                  : 'bg-amber-500 text-black shadow-[0_4px_20px_rgba(245,158,11,0.3)] active:scale-95'
              }`}
            >
              {buyingId === 'no_ads' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <ShoppingBag size={14} />
                </motion.div>
              ) : isPremiumActive ? (
                t.active
              ) : (
                formatPrice('R$ 9,99')
              )}
            </button>
          </div>

          <div className="bg-[#1B263B] border border-[#2A4A6B]/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#0D1B2A] rounded-2xl flex items-center justify-center text-2xl shadow-inner text-[#00C896]">
                <Pencil size={28} />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight">{t.changeNickname}</h3>
                <p className="text-[10px] text-[#7A9BBF] uppercase font-bold mt-0.5">{t.resetLimit}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                console.log('[Store] Clicking reset limit button');
                const servicePrice = 'R$ 5,99';
                const confirmPay = window.confirm(lang === 'en' ? `Buy ${t.changeNickname} for ${formatPrice(servicePrice)}?` : `Comprar ${t.changeNickname} por ${formatPrice(servicePrice)}?`);
                if (confirmPay) {
                  try {
                    console.log('[Store] Initiating Stripe session for reset');
                    setBuyingId('nickname_reset');
                    const url = await createCheckoutSession([{
                      name: t.changeNickname,
                      description: t.resetLimit,
                      amount: 599
                    }], lang === 'pt' ? 'brl' : 'usd');
                    if (url) {
                      console.log('[Store] Redirecting to Stripe:', url);
                      localStorage.setItem('pending_purchase', 'nickname_reset');
                      window.location.href = url;
                      return;
                    }
                  } catch (error: any) {
                    console.error('[Store] Stripe redirect failed:', error);
                    setStoreError(`${lang === 'en' ? 'Stripe Error:' : 'Erro do Stripe:'} ${error.message}`);
                    setBuyingId(null);
                    return;
                  }
                }
              }}
              disabled={buyingId !== null}
              className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_4px_0_#4C1D95] active:shadow-none active:translate-y-[4px] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {buyingId === 'nickname_reset' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <ShoppingBag size={14} />
                </motion.div>
              ) : formatPrice('R$ 5,99')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
