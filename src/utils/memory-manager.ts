/**
 * Memory Management Utility for Naver Search MCP Server
 * 메모리 누수 방지 및 리소스 관리를 위한 유틸리티
 */

import { NaverSearchClient } from "../clients/naver-search.client.js";
import { clearCategoriesCache } from "../handlers/category.handlers.js";

export interface MemoryUsage {
  rss: number; // Resident Set Size
  heapTotal: number; // Total heap size
  heapUsed: number; // Used heap size
  external: number; // External memory usage
  arrayBuffers: number; // ArrayBuffer memory usage
}

export interface MemoryStats {
  usage: MemoryUsage;
  timestamp: number;
  formattedUsage: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
    arrayBuffers: string;
  };
}

/**
 * 메모리 사용량 조회
 */
export function getMemoryUsage(): MemoryStats {
  const usage = (globalThis as any).process.memoryUsage();
  const timestamp = Date.now();

  const formatBytes = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return {
    usage,
    timestamp,
    formattedUsage: {
      rss: formatBytes(usage.rss),
      heapTotal: formatBytes(usage.heapTotal),
      heapUsed: formatBytes(usage.heapUsed),
      external: formatBytes(usage.external),
      arrayBuffers: formatBytes(usage.arrayBuffers),
    },
  };
}

/**
 * 메모리 누수 감지 임계값 (MB)
 */
const MEMORY_THRESHOLDS = {
  WARNING: 200, // 200MB
  CRITICAL: 500, // 500MB
  EMERGENCY: 1024, // 1GB
};

/**
 * 메모리 상태 확인
 */
export function checkMemoryHealth(): {
  status: 'healthy' | 'warning' | 'critical' | 'emergency';
  recommendation: string;
  stats: MemoryStats;
} {
  const stats = getMemoryUsage();
  const heapUsedMB = stats.usage.heapUsed / 1024 / 1024;

  let status: 'healthy' | 'warning' | 'critical' | 'emergency' = 'healthy';
  let recommendation = '메모리 사용량이 정상 범위입니다.';

  if (heapUsedMB > MEMORY_THRESHOLDS.EMERGENCY) {
    status = 'emergency';
    recommendation = '즉시 메모리 정리가 필요합니다. 서버 재시작을 고려하세요.';
  } else if (heapUsedMB > MEMORY_THRESHOLDS.CRITICAL) {
    status = 'critical';
    recommendation = '메모리 사용량이 위험 수준입니다. 리소스 정리를 수행하세요.';
  } else if (heapUsedMB > MEMORY_THRESHOLDS.WARNING) {
    status = 'warning';
    recommendation = '메모리 사용량이 높습니다. 모니터링을 계속하세요.';
  }

  return { status, recommendation, stats };
}

/**
 * 포괄적인 메모리 정리 수행
 */
export async function performMemoryCleanup(): Promise<{
  before: MemoryStats;
  after: MemoryStats;
  cleanupActions: string[];
}> {
  const before = getMemoryUsage();
  const cleanupActions: string[] = [];

  try {
    // 1. 클라이언트 인스턴스 정리
    NaverSearchClient.destroyInstance();
    cleanupActions.push('NaverSearchClient 인스턴스 정리 완료');

    // 2. 카테고리 캐시 정리
    clearCategoriesCache();
    cleanupActions.push('카테고리 캐시 정리 완료');

    // 3. 가비지 컬렉션 강제 실행 (가능한 경우)
    if ((globalThis as any).gc) {
      (globalThis as any).gc();
      cleanupActions.push('가비지 컬렉션 강제 실행 완료');
    } else {
      cleanupActions.push('가비지 컬렉션 사용 불가 (--expose-gc 플래그 필요)');
    }

    // 4. 잠시 대기하여 정리 작업 완료
    await new Promise(resolve => setTimeout(resolve, 100));

  } catch (error) {
    cleanupActions.push(`정리 중 오류 발생: ${error}`);
  }

  const after = getMemoryUsage();

  return { before, after, cleanupActions };
}

/**
 * 메모리 사용량 모니터링 클래스
 */
export class MemoryMonitor {
  private intervalId: any = null;
  private memoryHistory: MemoryStats[] = [];
  private maxHistorySize = 10;

  /**
   * 메모리 모니터링 시작
   */
  start(intervalMs: number = 60000): void { // 기본 1분 간격
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      const stats = getMemoryUsage();
      this.memoryHistory.push(stats);

      // 히스토리 크기 제한
      if (this.memoryHistory.length > this.maxHistorySize) {
        this.memoryHistory.shift();
      }

      // 메모리 상태 확인 및 로깅
      const health = checkMemoryHealth();
      if (health.status !== 'healthy') {
        console.error(`[Memory Monitor] Status: ${health.status}, Usage: ${health.stats.formattedUsage.heapUsed}, Recommendation: ${health.recommendation}`);

        // 위험 수준에서 자동 정리 수행
        if (health.status === 'critical' || health.status === 'emergency') {
          this.performAutoCleanup();
        }
      }
    }, intervalMs);

    console.error(`[Memory Monitor] Started monitoring with ${intervalMs}ms interval`);
  }

  /**
   * 메모리 모니터링 중지
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.error('[Memory Monitor] Monitoring stopped');
    }
  }

  /**
   * 메모리 히스토리 조회
   */
  getHistory(): MemoryStats[] {
    return [...this.memoryHistory];
  }

  /**
   * 메모리 사용량 트렌드 분석
   */
  analyzeTrend(): {
    trend: 'increasing' | 'decreasing' | 'stable';
    averageUsage: number;
    maxUsage: number;
    minUsage: number;
  } {
    if (this.memoryHistory.length < 3) {
      return {
        trend: 'stable',
        averageUsage: 0,
        maxUsage: 0,
        minUsage: 0
      };
    }

    const usages = this.memoryHistory.map(stat => stat.usage.heapUsed);
    const recent = usages.slice(-3);

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recent[2] > recent[1] && recent[1] > recent[0]) {
      trend = 'increasing';
    } else if (recent[2] < recent[1] && recent[1] < recent[0]) {
      trend = 'decreasing';
    }

    return {
      trend,
      averageUsage: usages.reduce((a, b) => a + b, 0) / usages.length,
      maxUsage: Math.max(...usages),
      minUsage: Math.min(...usages)
    };
  }

  /**
   * 자동 메모리 정리 수행
   */
  private async performAutoCleanup(): Promise<void> {
    try {
      console.error('[Memory Monitor] Performing automatic memory cleanup...');
      const result = await performMemoryCleanup();

      const beforeMB = result.before.usage.heapUsed / 1024 / 1024;
      const afterMB = result.after.usage.heapUsed / 1024 / 1024;
      const savedMB = beforeMB - afterMB;

      console.error(`[Memory Monitor] Cleanup completed. Saved ${savedMB.toFixed(2)} MB`);
      console.error(`[Memory Monitor] Actions: ${result.cleanupActions.join(', ')}`);
    } catch (error) {
      console.error(`[Memory Monitor] Auto cleanup failed: ${error}`);
    }
  }
}

// 전역 메모리 모니터 인스턴스
let globalMemoryMonitor: MemoryMonitor | null = null;

/**
 * 글로벌 메모리 모니터 시작
 */
export function startGlobalMemoryMonitoring(intervalMs: number = 300000): void { // 기본 5분 간격
  if (!globalMemoryMonitor) {
    globalMemoryMonitor = new MemoryMonitor();
  }
  globalMemoryMonitor.start(intervalMs);
}

/**
 * 글로벌 메모리 모니터 중지
 */
export function stopGlobalMemoryMonitoring(): void {
  if (globalMemoryMonitor) {
    globalMemoryMonitor.stop();
    globalMemoryMonitor = null;
  }
}

/**
 * 현재 메모리 모니터 인스턴스 조회
 */
export function getGlobalMemoryMonitor(): MemoryMonitor | null {
  return globalMemoryMonitor;
}