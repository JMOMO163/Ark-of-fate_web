import request from '@/utils/request'

export interface StatisticsData {
  overview: {
    accountCount: number;
    characterCount: number;
    recordCount: number;
    totalIncome: number;
    boundIncome: number;
    tradeableIncome: number;
  };
  itemLevelDistribution: Array<{
    range: string;
    count: number;
  }>;
  dungeonUsage: Array<{
    name: string;
    count: number;
  }>;
  dungeonIncome: Array<{
    name: string;
    bound: number;
    tradeable: number;
  }>;
}

export interface StatisticsQuery {
  gameAccountId?: string;
  startDate?: string;
  endDate?: string;
  recordType?: 'current' | 'history';
}

export function getStatistics(params?: StatisticsQuery) {
  return request<StatisticsData>({
    url: '/api/statistics',
    method: 'get',
    params
  })
}

export function getAllDungeons() {
  return request<{ dungeons: DungeonData[] }>({
    url: '/api/statistics/dungeons/all',
    method: 'get'
  })
} 