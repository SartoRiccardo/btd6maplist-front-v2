import { ref, watch, type WatchSource } from "vue";

/**
 * Watches a reactive source and calls the callback only when
 * the JSON-serialized value actually changes. Fires immediately.
 */
export function useEmitOnChange<T>(
  source: WatchSource<T>,
  callback: (value: T) => void,
) {
  const last = ref("");
  watch(
    source,
    (value) => {
      const s = JSON.stringify(value);
      if (s !== last.value) {
        last.value = s;
        callback(value);
      }
    },
    { immediate: true },
  );
}
