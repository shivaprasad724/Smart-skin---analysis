export const useNativeApp = () => {
  const triggerHaptic = async () => {};

  const showToast = async (text) => {
    console.log('Toast:', text);
  };

  return { triggerHaptic, showToast };
};

