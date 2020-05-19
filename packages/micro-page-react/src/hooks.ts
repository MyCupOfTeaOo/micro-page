/* eslint-disable no-param-reassign */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  useMemo,
  Dispatch,
  SetStateAction,
  DependencyList,
} from 'react';
import { useLocation } from 'react-router-dom';
import lodash from 'lodash-es';
import { GetResponseType, CancellablePromise } from 'micro-page-core/es/utils';
import { Page } from 'micro-page-core/es/typings';
import {
  RenderContext,
  ProjectContext,
  PageContext,
  RunTimeProjectContext,
} from './context';

export function useLocalStorage<T = any>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(initialValue);
  const setLocalStorage = useCallback<Dispatch<SetStateAction<T>>>(
    disaptch => {
      if (lodash.isFunction(disaptch)) {
        setState(prev => {
          const nextValue = disaptch(prev);
          localStorage.setItem(key, JSON.stringify(nextValue));
          return nextValue;
        });
      } else {
        setState(disaptch);
        localStorage.setItem(key, JSON.stringify(disaptch));
      }
    },
    [key],
  );
  useEffect(() => {
    let seqValue = initialValue;
    try {
      const value = localStorage.getItem(key);
      if (value) seqValue = JSON.parse(value);
    } catch (err) {
      localStorage.removeItem(key);
      console.error(err, `${key}数据解析失败,删除`);
    }
    setState(seqValue);
  }, [key]);
  return [state, setLocalStorage];
}

export function useModal() {
  const [visible, setVisible] = useState(false);
  const onOk = useCallback(() => {
    setVisible(false);
  }, []);
  const onCancel = useCallback(() => {
    setVisible(false);
  }, []);
  return {
    visible,
    setVisible,
    onOk,
    onCancel,
  };
}

export function useDrawer() {
  const [visible, setVisible] = useState(false);

  const onClose = useCallback(() => {
    setVisible(false);
  }, []);
  return {
    visible,
    setVisible,
    onClose,
  };
}

export function useQuery() {
  const { search } = useLocation();
  return useMemo(
    () => lodash.fromPairs(Array.from(new URLSearchParams(search).entries())),
    [search],
  );
}

export function useMound() {
  const mound = useRef(true);
  useEffect(() => {
    return () => {
      mound.current = false;
    };
  }, []);
  return mound;
}

export function useRequest<
  Q extends (...args: any) => CancellablePromise<any> = (
    ...args: any
  ) => CancellablePromise<any>
>(
  requset: Q,
  options: {
    debounce?: {
      wait?: number;
    };
    params?: Parameters<Q>;
    first?: boolean;
    onSuccess?: (
      args: GetResponseType<ReturnType<Q>>,
      params: Parameters<Q>,
    ) => void;
    onError?: (err: Error, params: Parameters<Q>) => void;
    onFinish?: (
      args: GetResponseType<ReturnType<Q>> | undefined,
      err: Error | undefined,
      params?: Parameters<Q>,
    ) => void;
  } = {},
  deps: DependencyList = [],
) {
  const mound = useMound();
  const { first, onSuccess, onError, debounce, onFinish } = options;
  const [count, setCount] = useState(first ? 1 : 0);
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<string>();
  const [data, setData] = useState<GetResponseType<ReturnType<Q>>>();
  const paramsRef = useRef<Parameters<Q> | undefined>(options.params);
  const run = useCallback((...p: Parameters<Q>) => {
    paramsRef.current = p;
    setCount(prevCount => prevCount + 1);
  }, []);
  const reload = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, [run]);
  const normalRequest = useCallback(() => {
    const params = paramsRef.current;
    const req = requset(...((params as any) || []));
    req
      .then((res: GetResponseType<ReturnType<Q>>) => {
        setData(res);
        if (onSuccess) {
          onSuccess(res, params as Parameters<Q>);
        }
        return res;
      })
      .catch(err => {
        console.error(err);
        setError(err);
        if (onError) onError(err, params as Parameters<Q>);
        return err;
      })
      .then((resOrErr: GetResponseType<ReturnType<Q>> | Error | undefined) => {
        if (onFinish) {
          if (resOrErr instanceof Error) {
            onFinish(undefined, resOrErr, params);
          } else {
            onFinish(resOrErr, undefined, params);
          }
        }
      })
      .finally(() => {
        if (mound.current) setLoading(false);
      });
    return req;
  }, deps);
  const debounceRequest = useMemo(() => {
    if (!debounce) return;
    return lodash.debounce(normalRequest, debounce.wait);
  }, deps);
  useEffect(() => {
    if (count < 1) return;
    setLoading(true);
    if (debounceRequest) {
      debounceRequest();
    } else {
      const req = normalRequest();
      return req.cancel;
    }
  }, [count]);
  useEffect(() => {
    if (debounceRequest) {
      debounceRequest.flush();
    }
  }, []);
  return {
    loading,
    data,
    setData,
    error,
    run,
    paramsRef,
    reload,
    debounceRequest,
  };
}

/* -------------------------------------------------------------------------- */
/*                                common hooks                               */
/* -------------------------------------------------------------------------- */

export function useCore() {
  return useContext(RenderContext).core;
}

export function useBasePath() {
  return useContext(RenderContext).basePath;
}

export function useTemplates() {
  return useCore().config.templates;
}

export function useSearchTemplate(key?: string) {
  const templates = useTemplates();
  return useMemo(() => {
    return templates.find(template => template.key === key);
  }, [key, templates]);
}

export function usePage<S = any>() {
  return useContext(PageContext).page as Page<S>;
}

export function useTemplate() {
  return useContext(PageContext).template;
}

/* -------------------------------------------------------------------------- */
/*                                compile hooks                               */
/* -------------------------------------------------------------------------- */

export function useProjectStore() {
  return useContext(ProjectContext).store;
}

/* -------------------------------------------------------------------------- */
/*                                runtime hooks                               */
/* -------------------------------------------------------------------------- */

export function useProject() {
  return useContext(RunTimeProjectContext);
}
