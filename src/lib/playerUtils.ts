export interface PlayerData {
  nickname: string;
  avatar: string;
  customAvatar?: string;
  level: number;
  xp: number;
  coins: number;
  unlockedAvatars: string[];
  mazeSkin: string;
  unlockedSkins: string[];
  nicknameChanged: boolean;
  redeemedMissions: string[];
  missionProgress: Record<string, number>;
  doubleRewardUntil?: number; // timestamp
  lastDailyLoginClaimedAt?: number; // timestamp
  language?: 'pt' | 'en';
}

export const translations = {
    pt: {
    start: 'Iniciar',
    play: 'Jogar',
    language: 'Idioma',
    missions: 'Missões',
    achievements: 'Conquistas',
    security: 'Segurança',
    doubleReward: 'Recompensa em Dobro',
    active: 'Ativo',
    level: 'Nível',
    coins: 'Moedas',
    selectLanguage: 'Selecione seu Idioma',
    wins: 'Vitórias',
    labyrinths: 'Labirintos',
    back: 'Voltar',
    claim: 'Resgatar',
    dailyLogin: 'Login Diário',
    nextLabyrinth: 'Próximo Labirinto',
    collectDouble: 'Coletar em Dobro',
    victory: 'Vitória!',
    stars: 'Estrelas',
    missionsTitle: 'Centro de Missões',
    redeem: 'Resgatar Recompensa',
    progress: 'Progresso',
    completed: 'Missão Concluída',
    newMissionsIn: 'Novas missões em',
    profile: {
      title: 'Perfil',
      editNickname: 'Editar Nickname',
      skins: 'Skins',
      avatars: 'Avatars',
      save: 'Salvar',
      cancel: 'Cancelar',
      equipped: 'Equipado',
      equip: 'Equipar',
      locked: 'Bloqueado'
    },
    store: {
      title: 'Loja',
      buy: 'Comprar',
      bought: 'Comprado',
      insufficientCoins: 'moedas insuficientes!'
    },
    tabs: {
      daily: 'DIÁRIAS',
      weekly: 'SEMANAIS',
      unique: 'ÚNICAS'
    },
    difficulty: {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil'
    }
  },
    en: {
    start: 'Start',
    play: 'Play',
    language: 'Language',
    missions: 'Missions',
    achievements: 'Achievements',
    security: 'Security',
    doubleReward: 'Double Reward',
    active: 'Active',
    level: 'Level',
    coins: 'Coins',
    selectLanguage: 'Select your Language',
    wins: 'Wins',
    labyrinths: 'Mazes',
    back: 'Back',
    claim: 'Claim',
    dailyLogin: 'Daily Login',
    nextLabyrinth: 'Next Maze',
    collectDouble: 'Collect Double',
    victory: 'Victory!',
    stars: 'Stars',
    missionsTitle: 'Missions Center',
    redeem: 'Redeem Reward',
    progress: 'Progress',
    completed: 'Mission Completed',
    newMissionsIn: 'New missions in',
    profile: {
      title: 'Profile',
      editNickname: 'Edit Nickname',
      skins: 'Skins',
      avatars: 'Avatars',
      save: 'Save',
      cancel: 'Cancel',
      equipped: 'Equipped',
      equip: 'Equip',
      locked: 'Locked'
    },
    store: {
      title: 'Store',
      buy: 'Buy',
      bought: 'Bought',
      insufficientCoins: 'not enough coins!'
    },
    tabs: {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      unique: 'UNIQUE'
    },
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard'
    }
  }
};

export function getPlayerData(): PlayerData {
  const defaultData: PlayerData = {
    nickname: 'Explorador',
    avatar: '🧑',
    level: 1,
    xp: 0,
    coins: 100,
    unlockedAvatars: ['🧑'],
    mazeSkin: '🧑',
    unlockedSkins: ['🧑'],
    nicknameChanged: false,
    redeemedMissions: [],
    missionProgress: {
      '1': 1,
      '3': 3,
      '7': 45,
      '8': 12,
      '5': 12,
      '6': 8,
      '4': 4,
      'DAILY_LOGIN': 0
    },
    doubleRewardUntil: 0,
    lastDailyLoginClaimedAt: 0,
    language: undefined
  };

  const stored = localStorage.getItem('player_data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge stored data with defaults to ensure new fields are present
      const merged = { ...defaultData, ...parsed };
      
      // Migration for unlockedAvatars - keep it simple
      if (!merged.unlockedAvatars || merged.unlockedAvatars.length === 0) {
        merged.unlockedAvatars = ['🧑'];
      }
      
      // Filter out removed avatars if they were from defaults
      const defaultsToRemove = ['🤖', '🐱', '🦊', '🦁', '🦉', '🐲'];
      merged.unlockedAvatars = merged.unlockedAvatars.filter(av => !defaultsToRemove.includes(av) || av === merged.avatar);
      
      if (merged.avatar === '🥷') {
        merged.avatar = defaultData.avatar;
      }

      // Ensure mazeSkin and unlockedSkins exist if they were missing (new update)
      if (!merged.mazeSkin) merged.mazeSkin = merged.avatar;
      if (!merged.unlockedSkins || merged.unlockedSkins.length === 0) {
        merged.unlockedSkins = [merged.mazeSkin];
      }
      
      return merged;
    } catch (e) {
      console.error('Error parsing player data', e);
    }
  }
  
  localStorage.setItem('player_data', JSON.stringify(defaultData));
  return defaultData;
}

export function updatePlayerData(updates: Partial<PlayerData>) {
  const current = getPlayerData();
  const updated = { ...current, ...updates };
  localStorage.setItem('player_data', JSON.stringify(updated));
  return updated;
}
