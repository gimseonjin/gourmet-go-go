import { CircuitBreaker } from './circuit.breaker';

describe('CircuitBreaker', () => {
  test('닫힌 상태에서 요청 함수를 성공적으로 호출해야 함', async () => {
    const mockRequestFunction = jest.fn().mockResolvedValue('success');
    const breaker = new CircuitBreaker(mockRequestFunction, 'breaker', {});

    const result = await breaker.fire({});
    expect(result).toEqual('success');
    expect(mockRequestFunction).toHaveBeenCalledTimes(1);
  });

  test('연속 실패 후 서킷 브레이커가 열림 상태로 전환되고 요청을 호출하지 않아야 함', async () => {
    const mockRequestFunction = jest.fn().mockRejectedValue(new Error('fail'));
    const breaker = new CircuitBreaker(mockRequestFunction, 'breaker', {
      failureThreshold: 1,
      timeout: 100,
    });

    await expect(breaker.fire({})).rejects.toThrow('fail');

    expect(breaker['state']).toBe('OPENED');
    expect(mockRequestFunction).toHaveBeenCalledTimes(1);

    await expect(breaker.fire({})).rejects.toThrow(
      'Circuit is in open state right now. Please try again later.',
    );
  });

  test('반열림 상태에서 성공적인 요청 후 닫힌 상태로 전환되어야 함', async () => {
    jest.useFakeTimers();
    const mockRequestFunction = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');
    const breaker = new CircuitBreaker(mockRequestFunction, 'breaker', {
      failureThreshold: 1,
      timeout: 100,
    });

    await expect(breaker.fire({})).rejects.toThrow('fail');

    jest.advanceTimersByTime(200);

    const result = await breaker.fire({});
    expect(result).toEqual('success');
    expect(breaker['state']).toBe('CLOSED');
    expect(mockRequestFunction).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
