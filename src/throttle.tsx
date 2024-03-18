import 'dotenv/config';
import debug from 'debug';

const logger = debug('core');

type Task = () => Promise<number>;


const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load: Task[] = delays.map((delay) => (): Promise<number> => 
    new Promise((resolve) => {
        setTimeout(() => resolve(Math.floor(delay / 100)), delay);
    })
);

const throttle = async (workers: number, tasks: Task[]): Promise<number[]> => {
  let index = 0;
  const results: number[] = [];

  const executor = async (): Promise<void> => {
      while (index < tasks.length) {
          const currentIndex = index;
          index += 1;
          const result = await tasks[currentIndex]();
          results[currentIndex] = result;
      }
  };

  const workersArray = Array(workers).fill(null).map(executor);
  await Promise.all(workersArray);
  return results;
};

const bootstrap = async () => {
    logger('Starting...');
    const start = Date.now();
    const answers = await throttle(5, load);
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
};

bootstrap().catch((err) => {
    logger('General fail: %O', err);
});
