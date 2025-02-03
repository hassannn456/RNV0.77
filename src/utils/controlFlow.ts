import {NormalResult} from '../../@types';
import {ScreenList} from '../Controller';
import {MgaNavigationFunction} from '../Controller';
export interface ConditionalPrompt {
  displayName: string;
  predicate: () => boolean;
  userInputFlow: () => Promise<NormalResult<any>>;
}

export const executeConditionalPromptChain = async (
  prompts: Array<ConditionalPrompt>,
): Promise<void> => {
  for (const prompt of prompts) {
    if (prompt.predicate()) {
      const result = await prompt.userInputFlow();
      if (!result.success) {
        // Prompt promise was rejected. Throw error to be handled by caller
        throw result;
      }
    }
  }
};

interface PromptControls {
  send: (id: number | undefined, message: NormalResult<boolean>) => void;
  show: (
    option?: ScreenList[keyof ScreenList],
  ) => Promise<NormalResult<boolean>>;
}

export const promptManagerFactory = (
  screenName: keyof ScreenList,
  navFn: MgaNavigationFunction,
): PromptControls => {
  let nid = 0;
  let receivers: {
    id: number;
    resolver: (value: NormalResult<boolean>) => void;
  }[] = [];

  return {
    send: (id, message) => {
      const receiver = receivers.filter(r => r.id == id)[0];
      receiver?.resolver(message);
    },
    show: (option?: ScreenList[keyof ScreenList]) => {
      nid = nid + 1;
      return new Promise(resolve => {
        navFn(screenName, {...option, id: nid});
        receivers.push({
          id: nid,
          resolver: value => {
            resolve(value);
            receivers = receivers.filter(r => r.id != nid);
          },
        });
      });
    },
  } as PromptControls;
};
