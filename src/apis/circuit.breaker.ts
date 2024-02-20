type RequestFunction = () => Promise<any>;

type CircuitBreakerOptions = {
  failureThreshold?: number;
  timeout?: number;
};

export class CircuitBreaker<T, U> {
  private state: 'OPENED' | 'CLOSED' | 'HALF' = 'CLOSED';
  private failureCount = 0;
  private timeout: number;
  private failureThreshold: number;
  private resetAfter: number;

  constructor(
    private readonly requestFunction: (params: T) => Promise<U>,
    public readonly instanceName: string,
    options?: CircuitBreakerOptions,
  ) {
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.timeout = options?.timeout ?? 5000;

    this.resetAfter = Date.now() + this.timeout;
  }

  async fire(params: T): Promise<U> {
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
      const response = await this.requestFunction(params);
      return this.success(response);
    } catch (err) {
      this.failure(err.message);
      throw err;
    }
  }

  success(data: any) {
    this.failureCount = 0;
    if (this.state === 'HALF') {
      this.state = 'CLOSED';
    }
    return data;
  }

  failure(msg: any) {
    this.failureCount += 1;
    if (this.state === 'HALF' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPENED';
      this.resetAfter = Date.now() + this.timeout;
    }
    console.error('');
  }
}
