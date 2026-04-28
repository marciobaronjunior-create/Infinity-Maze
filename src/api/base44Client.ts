// Local storage based ranking for the "base44" mock
export const base44 = {
  entities: {
    RankingEntry: {
      create: async (data: { nickname: string; avatar: string; customAvatar?: string; time: number; difficulty: string }) => {
        const ranking = JSON.parse(localStorage.getItem('global_ranking') || '[]');
        ranking.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('global_ranking', JSON.stringify(ranking));
        return { success: true };
      },
      list: async () => {
        return JSON.parse(localStorage.getItem('global_ranking') || '[]');
      }
    }
  }
};
