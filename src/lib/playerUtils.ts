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
    achievementsTitle: 'Conquistas',
    unlocked: 'Desbloqueado',
    activated: 'Ativado',
    deactivated: 'Desativado',
    public: 'Público',
    privateStatus: 'Privado',
    securityStatus: {
      protected: 'Status: Protegido',
      attention: 'Status: Atenção',
      protectedDesc: 'Sua conta está com proteção máxima.',
      attentionDesc: 'Ative todas as opções para proteção total.'
    },
    securityItems: {
      privacy: { title: 'Privacidade da Conta', desc: 'Gerencie quem pode ver seu perfil e estatísticas.' },
      anonymous: { title: 'Modo Anônimo', desc: 'Esconda seu nickname no ranking global.' },
      notifications: { title: 'Alertas de Acesso', desc: 'Receba notificações de novos logins.' }
    },
    specialServices: 'Serviços Especiais',
    changeNickname: 'Mudar de apelido',
    resetLimit: 'Resetar limite de alteração',
    resetSuccess: 'Limite resetado com sucesso! Vá ao seu perfil para alterar seu apelido.',
    simulatePayment: 'Deseja simular o pagamento de {price} para {item}?',
    skinsData: {
      bowlMaster: 'Mestre do Bowl',
      fantasmao: 'Fantasmão',
      zumbi: 'Zumbi',
      heroi: 'Herói',
      vampiro: 'Vampiro',
      sereia: 'Sereia',
      unicornio: 'Unicórnio',
      dragao: 'Dragão Imperial',
      cosmos: 'Cosmos'
    },
    deleteAccount: 'Excluir Conta Permanentemente',
    deleteModal: {
      title: 'TEM CERTEZA?',
      description: 'Esta ação é irreversível. Todo o seu progresso, nível e conquistas serão apagados permanentemente.',
      confirm: 'Sim, Excluir Tudo',
      cancel: 'Cancelar'
    },
    generatingMaze: 'Gerando labirinto...',
    victoryMessage: 'Você completou o labirinto em ',
    activeMissions: '{count} Ativas',
    starsCount: '2/4',
    confirmNicknameChange: 'Confirmar Alteração',
    ranking: 'Ranking',
    explorerLevel: 'Explorador Nível',
    changeNicknameError: 'Você já alterou seu apelido uma vez!',
    confirmNicknameReset: 'Deseja simular o pagamento de R$ 5,99 para resetar o limite de alteração de apelido?',
    doubleRewardActive: 'Recompensa em Dobro Ativa!',
    timeLeft: 'Restam {time}',
    watchAd: 'Assista anúncio +5 min',
    maxTimeReached: 'Você já atingiu o tempo máximo de 15 minutos!',
    watchAdConfirmation: 'Assista a um breve anúncio para ganhar 5 minutos de RECOMPENSA EM DOBRO!',
    doubleRewardActivated: 'Recompensa em dobro ativada!',
    mazeSize: 'Labirinto {size}',
    doubleReward: 'Recompensa em Dobro',
    active: 'Ativo',
    level: 'Nível',
    coins: 'Moedas',
    explorer: 'Explorador',
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
    achievementsTitle: 'Achievements',
    unlocked: 'Unlocked',
    activated: 'Activated',
    deactivated: 'Deactivated',
    public: 'Public',
    privateStatus: 'Private',
    securityStatus: {
      protected: 'Status: Protected',
      attention: 'Status: Attention',
      protectedDesc: 'Your account has maximum protection.',
      attentionDesc: 'Enable all options for full protection.'
    },
    securityItems: {
      privacy: { title: 'Account Privacy', desc: 'Manage who can see your profile and stats.' },
      anonymous: { title: 'Anonymous Mode', desc: 'Hide your nickname in the global ranking.' },
      notifications: { title: 'Access Alerts', desc: 'Receive notifications of new logins.' }
    },
    specialServices: 'Special Services',
    changeNickname: 'Change Nickname',
    resetLimit: 'Reset change limit',
    resetSuccess: 'Limit reset! Go to profile to change your nickname.',
    simulatePayment: 'Simulate payment of {price} for {item}?',
    skinsData: {
      bowlMaster: 'Bowl Master',
      fantasmao: 'Big Ghost',
      zumbi: 'Zombie',
      heroi: 'Hero',
      vampiro: 'Vampire',
      sereia: 'Mermaid',
      unicornio: 'Unicorn',
      dragao: 'Imperial Dragon',
      cosmos: 'Cosmos'
    },
    deleteAccount: 'Delete Account Permanently',
    deleteModal: {
      title: 'ARE YOU SURE?',
      description: 'This action is irreversible. All your progress, level and achievements will be permanently erased.',
      confirm: 'Yes, Delete Everything',
      cancel: 'Cancel'
    },
    generatingMaze: 'Generating maze...',
    victoryMessage: 'You completed the maze in ',
    activeMissions: '{count} Active',
    starsCount: '2/4',
    confirmNicknameChange: 'Confirm Nickname Change',
    ranking: 'Ranking',
    explorerLevel: 'Explorer Level',
    changeNicknameError: 'You already changed your nickname once!',
    confirmNicknameReset: 'Simulate payment of USD $ 5,99 to reset nickname change limit?',
    doubleRewardActive: 'Double Reward Active!',
    timeLeft: 'Left {time}',
    watchAd: 'Watch ad +5 min',
    maxTimeReached: 'You already reached the 15 min limit!',
    watchAdConfirmation: 'Watch a short ad to earn 5 minutes of DOUBLE REWARD?',
    doubleRewardActivated: 'Double reward activated!',
    mazeSize: '{size} Maze',
    doubleReward: 'Double Reward',
    active: 'Active',
    level: 'Level',
    coins: 'Coins',
    explorer: 'Explorer',
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
