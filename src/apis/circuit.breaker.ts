type RequestFunction = () => Promise<any>;

type CircuitBreakerOptions = {
  failureThreshold?: number;
  timeout?: number;
};

export default class CircuitBreaker {
  private state: 'OPENED' | 'CLOSED' | 'HALF' = 'CLOSED';
  private failureCount = 0;
  private timeout: number;
  private failureThreshold: number;
  private resetAfter: number;

  constructor(
    private readonly request: RequestFunction,
    options?: CircuitBreakerOptions,
  ) {
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.timeout = options?.timeout ?? 5000;

    this.resetAfter = Date.now() + this.timeout;
  }

  async fire() {
    if (this.state === 'OPENED') {
      if (this.resetAfter <= Date.now()) {
        this.state = 'HALF';
      } else {
        throw new Error(
          'Circuit is in open state right now. Please try again later.',
        );
      }
    }
    try {
      const response = await this.request();
      return this.success(response.data);
    } catch (err) {
      return this.failure(err.message);
    }
  }

  success(data: any) {
    this.failureCount = 0;
    if (this.state === 'HALF') {
      this.state = 'CLOSED';
    }
    return data;
  }

  failure(data: any) {
    this.failureCount += 1;
    if (this.state === 'HALF' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPENED';
      this.resetAfter = Date.now() + this.timeout;
    }
    return data;
  }
}
