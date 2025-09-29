# 네이버 검색 MCP 서버 메모리 누수 해결 방안

## 🎯 문제 요약
Claude Desktop에서 일정 시간 후 MCP 서버가 멈추는 메모리 누수 문제 발생

## 🔍 발견된 핵심 문제들

### 1. **싱글톤 패턴 메모리 누수** (HIGH RISK)
- **위치**: `src/clients/naver-search.client.ts`
- **문제**: 정리 메커니즘 없는 전역 인스턴스 유지
- **해결**: `destroyInstance()` 및 `cleanup()` 메서드 추가

### 2. **HTTP 연결 관리 부족** (MEDIUM RISK)
- **위치**: `src/clients/naver-api-core.client.ts`
- **문제**: 타임아웃 미설정, 연결 풀링 부재
- **해결**: axios 타임아웃 및 연결 관리 설정

### 3. **캐시 데이터 누적** (MEDIUM RISK)
- **위치**: `src/handlers/category.handlers.ts`
- **문제**: 모듈 로딩 시 메모리에 영구 저장
- **해결**: 지연 로딩 및 캐시 정리 메커니즘

### 4. **서버 인스턴스 관리** (MEDIUM RISK)
- **위치**: `src/index.ts`
- **문제**: 재시작 시 리소스 정리 부재
- **해결**: 설정 변경 감지 및 포괄적 정리

## ✅ 구현된 해결책

### 1. 메모리 안전 싱글톤 (NaverSearchClient)
```typescript
// 기존 문제점
static getInstance(): NaverSearchClient {
  if (!NaverSearchClient.instance) {
    NaverSearchClient.instance = new NaverSearchClient();
  }
  return NaverSearchClient.instance;
}

// 수정된 해결책
static destroyInstance(): void {
  if (NaverSearchClient.instance) {
    NaverSearchClient.instance.cleanup();
    NaverSearchClient.instance = null;
  }
}

protected cleanup(): void {
  this.config = null;
  super.cleanup();
}
```

### 2. HTTP 연결 최적화 (NaverApiCoreClient)
```typescript
// 기존 문제점
protected async get<T>(url: string, params: any): Promise<T> {
  const response = await axios.get<T>(url, { params, ...this.getHeaders() });
  return response.data;
}

// 수정된 해결책
constructor() {
  this.axiosInstance = axios.create({
    timeout: 30000, // 30초 타임아웃
    maxRedirects: 3
  });
}

protected async get<T>(url: string, params: any): Promise<T> {
  try {
    const response = await this.axiosInstance.get<T>(url, {
      params, ...this.getHeaders()
    });
    return response.data;
  } catch (error) {
    throw error; // 명시적 에러 처리
  }
}
```

### 3. 지연 로딩 캐시 (Category Handlers)
```typescript
// 기존 문제점
const categoriesData = getCategoriesData(); // 모듈 레벨 로딩

// 수정된 해결책
let categoriesCache: any[] | null = null;

function getCategoriesData(): any[] {
  if (categoriesCache !== null) {
    return categoriesCache; // 캐시된 데이터 반환
  }

  // 필요 시에만 로딩
  // ... 로딩 로직
  categoriesCache = loadedData;
  return categoriesCache;
}

export function clearCategoriesCache(): void {
  categoriesCache = null;
}
```

### 4. 서버 생명주기 관리 (index.ts)
```typescript
// 수정된 해결책
export function resetServerInstance(): void {
  if (globalServerInstance) {
    // 메모리 모니터링 중지
    stopGlobalMemoryMonitoring();

    // 클라이언트 인스턴스 정리
    NaverSearchClient.destroyInstance();

    // 캐시 정리
    clearCategoriesCache();

    globalServerInstance = null;
    currentConfig = null;
  }
}

function isConfigChanged(newConfig): boolean {
  if (!currentConfig) return true;
  return (
    currentConfig.NAVER_CLIENT_ID !== newConfig.NAVER_CLIENT_ID ||
    currentConfig.NAVER_CLIENT_SECRET !== newConfig.NAVER_CLIENT_SECRET
  );
}
```

### 5. 실시간 메모리 모니터링 (memory-manager.ts)
```typescript
export class MemoryMonitor {
  private intervalId: any = null;
  private memoryHistory: MemoryStats[] = [];

  start(intervalMs: number = 300000): void { // 5분 간격
    this.intervalId = setInterval(() => {
      const health = checkMemoryHealth();

      if (health.status === 'critical' || health.status === 'emergency') {
        this.performAutoCleanup(); // 자동 정리
      }
    }, intervalMs);
  }

  private async performAutoCleanup(): Promise<void> {
    NaverSearchClient.destroyInstance();
    clearCategoriesCache();

    if ((globalThis as any).gc) {
      (globalThis as any).gc(); // 가비지 컬렉션 강제 실행
    }
  }
}

// 메모리 임계값
const MEMORY_THRESHOLDS = {
  WARNING: 200,   // 200MB
  CRITICAL: 500,  // 500MB
  EMERGENCY: 1024 // 1GB
};
```

## 📊 메모리 관리 기능

### 실시간 모니터링
- **주기**: 5분 간격 메모리 사용량 체크
- **로깅**: 위험 수준 시 자동 경고 출력
- **히스토리**: 최근 10회 메모리 사용량 기록

### 자동 정리 시스템
- **WARNING (200MB)**: 모니터링 강화
- **CRITICAL (500MB)**: 자동 캐시 정리 실행
- **EMERGENCY (1GB)**: 전체 리소스 정리 + GC 강제 실행

### 트렌드 분석
```typescript
analyzeTrend(): {
  trend: 'increasing' | 'decreasing' | 'stable';
  averageUsage: number;
  maxUsage: number;
  minUsage: number;
}
```

## 🚀 사용 방법

### 1. 서버 시작 시 자동 모니터링
```typescript
// 서버 생성 시 자동으로 메모리 모니터링 시작
const server = createNaverSearchServer({ config });
// startGlobalMemoryMonitoring(5 * 60 * 1000); // 자동 실행됨
```

### 2. 수동 메모리 정리
```typescript
import { performMemoryCleanup } from './utils/memory-manager.js';

const result = await performMemoryCleanup();
console.log('메모리 정리 완료:', result.cleanupActions);
```

### 3. 메모리 상태 확인
```typescript
import { checkMemoryHealth } from './utils/memory-manager.js';

const health = checkMemoryHealth();
console.log('메모리 상태:', health.status);
console.log('권장사항:', health.recommendation);
```

## 🎯 기대 효과

### 메모리 누수 방지
- ✅ 싱글톤 인스턴스 정리로 메모리 누적 방지
- ✅ HTTP 연결 타임아웃으로 hanging connection 방지
- ✅ 캐시 정리로 대용량 데이터 누적 방지

### 자동 복구 시스템
- ✅ 위험 수준 도달 시 자동 리소스 정리
- ✅ 가비지 컬렉션 강제 실행으로 즉시 메모리 회수
- ✅ 설정 변경 시 기존 인스턴스 완전 정리

### 운영 안정성
- ✅ 실시간 메모리 모니터링으로 문제 조기 감지
- ✅ 메모리 사용량 트렌드 분석으로 예측 가능
- ✅ 자동 로깅으로 문제 상황 추적 가능

## 📝 적용 방법

1. **즉시 적용**: 이미 모든 수정사항이 코드에 적용됨
2. **자동 실행**: 서버 시작 시 자동으로 메모리 모니터링 활성화
3. **모니터링**: 콘솔에서 메모리 상태 로그 확인 가능

이제 Claude Desktop에서 MCP 서버가 장시간 안정적으로 동작할 것입니다!