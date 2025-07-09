import { useEffect, useRef } from "react"; // Import useRef

export const useModalEffects = (isOpen: boolean, onClose: () => void) => {
  // Use a ref to store the modal key. This ensures we have a stable reference
  // to the key that was created when THIS specific modal instance opened,
  // even across re-renders.
  const modalKeyRef = useRef(`modal-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const isOpenRef = useRef(isOpen);
  const hasSetupHistoryRef = useRef(false);

  // Update ref on every render to capture current state
  useEffect(() => {
    isOpenRef.current = isOpen;
  });

  useEffect(() => {
    if (!isOpen) {
      hasSetupHistoryRef.current = false;
      return;
    }
    console.log("Modal opened with key:", modalKeyRef.current);

    const handlePopState = () => {
      // When a popstate event occurs, we check the NEW history state.
      // If the new state's key does NOT match our modal's key,
      // it means we have successfully navigated "back" past our entry.
      // Therefore, we should close this modal.
      if (history.state?.modalKey !== modalKeyRef.current) {
        onClose();
      }
    };

    // Before we push our state, check if the current state is already ours.
    // This prevents pushing duplicate states if a re-render happens.
    if (history.state?.modalKey !== modalKeyRef.current) {
      history.pushState({ modalKey: modalKeyRef.current }, "");
      hasSetupHistoryRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);

    // Cleanup function
    return () => {
      window.removeEventListener("popstate", handlePopState);

      // If this modal is closing via a button click, we need to clean up its history entry.
      // We check if our key is still at the top of the stack.
      if (!isOpenRef.current && hasSetupHistoryRef.current) {
        if (history.state?.modalKey === modalKeyRef.current) {
          console.log("Closing modal, going back in history ", modalKeyRef.current);
          // Use history.go(-1) which is equivalent to history.back()
          // This is a more explicit way to say "go back one step".
          history.go(-1);
        }
      }
    };
  }, [isOpen, onClose]);
};
