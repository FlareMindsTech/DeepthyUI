import { useContext, useEffect } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

/**
 * Blocks internal navigation and shows a confirm dialog if `when` is true.
 */
export function usePrompt(when, message) {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const push = navigator.push;
    const replace = navigator.replace;

    const confirmNavigation = (args) => {
      if (window.confirm(message)) {
        return push.apply(navigator, args); // allow navigation
      }
      return false; // block navigation
    };

    navigator.push = (...args) => confirmNavigation(args);
    navigator.replace = (...args) => confirmNavigation(args);

    return () => {
      navigator.push = push;
      navigator.replace = replace;
    };
  }, [when, message, navigator]);
}
