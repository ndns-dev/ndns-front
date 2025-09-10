import { useState, useEffect } from 'react';

interface LoadingMessageConfig {
  initialMessage?: string;
  messages: {
    message: string;
    delay: number;
  }[];
}

interface LoadingMessageOptions {
  type?: 'modal' | 'inline';
}

const DEFAULT_MODAL_CONFIG: LoadingMessageConfig = {
  initialMessage: 'AI가 포스트를 분석하고 있습니다.',
  messages: [
    {
      message: 'AI가 포스트를 분석하고 있습니다.\n잠시만 기다려주세요.',
      delay: 2000,
    },
    {
      message: 'AI가 포스트를 분석하고 있습니다.\n조금만 더 기다려주세요.',
      delay: 5000,
    },
    {
      message: '혹시 협찬인지\n다시 한 번 꼼꼼히 확인하고 있어요.',
      delay: 9000,
    },
  ],
};

const DEFAULT_INLINE_CONFIG: LoadingMessageConfig = {
  initialMessage: '분석 중...',
  messages: [
    {
      message: 'AI가 포스트를 분석하고 있습니다.',
      delay: 2000,
    },
    {
      message: 'AI가 포스트를 분석하고 있습니다..',
      delay: 3000,
    },
    {
      message: 'AI가 포스트를 분석하고 있습니다...',
      delay: 4000,
    },
    {
      message: '내돈내산인지 검증하는데 다소 오래 걸릴 수 있어요.',
      delay: 5000,
    },
    {
      message: '조금만 더 기다려주세요.',
      delay: 7000,
    },
    {
      message: '조금만 더 기다려주세요..',
      delay: 8000,
    },
    {
      message: '조금만 더 기다려주세요...',
      delay: 9000,
    },
    {
      message: '혹시 협찬인지 다시 한 번 꼼꼼히 확인하고 있어요.',
      delay: 11000,
    },
    {
      message: '거의 다 왔어요!',
      delay: 15000,
    },
  ],
};

export const useLoadingMessage = (
  isLoading: boolean,
  options: LoadingMessageOptions = { type: 'inline' },
  config?: LoadingMessageConfig
) => {
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState<string | null>(null);

  useEffect(() => {
    const selectedConfig =
      config || (options.type === 'modal' ? DEFAULT_MODAL_CONFIG : DEFAULT_INLINE_CONFIG);

    if (!isLoading) {
      setMessage(selectedConfig.initialMessage || '');
      setSubMessage(null);
      return;
    }

    setMessage(selectedConfig.initialMessage || '');

    const timers = selectedConfig.messages.map(({ message, delay }) =>
      setTimeout(() => {
        if (delay === 12000 && options.type === 'modal') {
          // 모달의 경우 마지막 메시지는 subMessage로 설정
          setSubMessage(message);
        } else {
          setMessage(message);
        }
      }, delay)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      setMessage(selectedConfig.initialMessage || '');
      setSubMessage(null);
    };
  }, [isLoading, options.type, config]);

  return { message, subMessage };
};
