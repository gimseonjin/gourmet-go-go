import { CircuitBreaker } from './circuit.breaker';

describe('CircuitBreaker', () => {
  test('닫힌 상태에서 요청 함수를 성공적으로 호출해야 함', async () => {
    const mockRequestFunction = jest
      .fn()
      .mockResolvedValue({ data: 'success' });
    const breaker = new CircuitBreaker(mockRequestFunction);

    const result = await breaker.fire({});
    expect(result).toEqual({ data: 'success' });
    expect(mockRequestFunction).toHaveBeenCalledTimes(1);
  });

  test('연속 실패 후 서킷 브레이커가 열림 상태로 전환되고 요청을 호출하지 않아야 함', async () => {
    const mockRequestFunction = jest.fn().mockRejectedValue(new Error('fail'));
    const breaker = new CircuitBreaker(mockRequestFunction, {
      failureThreshold: 1,
      timeout: 100,
    });

    try {
      await breaker.fire({});
    } catch (error) {}

    expect(breaker['state']).toBe('OPENED');
    expect(mockRequestFunction).toHaveBeenCalledTimes(1);

    await expect(breaker.fire({})).rejects.toThrow(
      'Circuit is in open state right now. Please try again later.',
    );
  });

  test('타임아웃 후 서킷 브레이커가 반 열림 상태로 리셋되어야 함', async () => {
    jest.useFakeTimers();
    const mockRequestFunction = jest.fn().mockRejectedValue(new Error('fail'));
    const breaker = new CircuitBreaker(mockRequestFunction, {
      failureThreshold: 1,
      timeout: 100,
    });

    try {
      await breaker.fire({});
    } catch (error) {}

    jest.advanceTimersByTime(200);

    breaker.fire({}).catch((error) => {
      expect(breaker['state']).toBe('HALF');
    });

    jest.useRealTimers();
  });

  it('반열림 상태에서 성공적인 요청 후 닫힌 상태로 전환되어야 함', async () => {
    jest.useFakeTimers();
    const mockRequestFunction = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ data: 'success' });
    const breaker = new CircuitBreaker(mockRequestFunction, {
      failureThreshold: 1,
      timeout: 100,
    });

    try {
      await breaker.fire({});
    } catch (error) {}

    jest.advanceTimersByTime(200);

    const result = await breaker.fire({});

    expect(result).toEqual({ data: 'success' });
    expect(breaker['state']).toBe('CLOSED');
    expect(mockRequestFunction).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
