import { useCallback, useEffect, useRef } from "react";

const useResetAfterSuccess = ({
  submitting,
  success,
  error,
  onSuccess,
}) => {
  const pendingRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!pendingRef.current || submitting) return;

    if (success) {
      pendingRef.current = false;
      onSuccessRef.current?.();
      return;
    }

    if (error) {
      pendingRef.current = false;
    }
  }, [error, submitting, success]);

  return useCallback(() => {
    pendingRef.current = true;
  }, []);
};

export default useResetAfterSuccess;
