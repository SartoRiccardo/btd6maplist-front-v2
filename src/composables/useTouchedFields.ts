import { ref, inject, watch, provide, readonly, nextTick, type Ref } from 'vue'

const TOUCHED_FIELDS_KEY = 'touchedFields'
const TOUCHED_GENERATION_KEY = 'touchedGeneration'
const TOUCH_ALL_GENERATION_KEY = 'touchAllGeneration'
const FORCE_ALL_TOUCHED_KEY = 'forceAllTouched'
const IS_TOUCHED_KEY = 'isTouchedFn'
const TOUCH_KEY = 'touchFn'

/**
 * Provider composable for parent forms.
 * Creates and provides the shared touched state that persists across tab switches.
 */
export function useTouchedProvider() {
  const touchedFields = ref<Set<string>>(new Set())
  const touchedGeneration = ref(0)
  const touchAllGeneration = ref(0)
  const forceAllTouched = ref(false)

  watch(touchedGeneration, () => {
    forceAllTouched.value = false
    touchedFields.value = new Set()
  })

  watch(touchAllGeneration, () => {
    forceAllTouched.value = true
  })

  async function clearTouched() {
    touchedGeneration.value++
    await nextTick()
  }

  async function touchAll() {
    touchAllGeneration.value++
    await nextTick()
  }

  function isTouched(field: string): boolean {
    return forceAllTouched.value || touchedFields.value.has(field)
  }

  function touch(field: string) {
    touchedFields.value.add(field)
  }

  provide(TOUCHED_FIELDS_KEY, touchedFields)
  provide(TOUCHED_GENERATION_KEY, readonly(touchedGeneration))
  provide(TOUCH_ALL_GENERATION_KEY, readonly(touchAllGeneration))
  provide(FORCE_ALL_TOUCHED_KEY, readonly(forceAllTouched))
  provide(IS_TOUCHED_KEY, isTouched)
  provide(TOUCH_KEY, touch)

  return {
    clearTouched,
    touchAll,
    touchedGeneration,
    touchAllGeneration,
    isTouched,
    touch,
  }
}

/**
 * Consumer composable for form sections/tabs.
 * Injects the shared touched state from the parent provider.
 */
export function useTouchedFields() {
  const touchedFields = inject<Ref<Set<string>>>(TOUCHED_FIELDS_KEY)
  const touchedGeneration = inject<Ref<number>>(TOUCHED_GENERATION_KEY)
  const touchAllGeneration = inject<Ref<number>>(TOUCH_ALL_GENERATION_KEY)
  const isTouched = inject<(field: string) => boolean>(IS_TOUCHED_KEY, () => false)
  const touch = inject<(field: string) => void>(TOUCH_KEY, () => {})

  return {
    isTouched,
    touch,
    touchedFields,
    touchedGeneration,
    touchAllGeneration,
  }
}
