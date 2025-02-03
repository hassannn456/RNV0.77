# Known Issues

## DEV ONLY: react-i18next - translation key lookup

`react-i18next` (in particular its `useTranslation` hook) has difficulty generating / matching types against its first argument often showing errors in functioning code. This is noted in [Issue #1601](https://github.com/i18next/react-i18next/issues/1601) and has a proposed fix in [PR #1911](https://github.com/i18next/i18next/pull/1911) not yet merged to main.

When the underlying issue is fixed, there will likely be necessary updates to: 
 
- `@types/i18next.d.ts`
- `components/MgaForm.tsx`

This error can be re-visited then.