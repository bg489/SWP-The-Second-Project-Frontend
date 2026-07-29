const valuesEqual = (left, right) => {
  if (Object.is(left, right)) return true;

  if (
    left &&
    right &&
    typeof left === "object" &&
    typeof right === "object"
  ) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return false;
};

const recordsEqual = (left, right) => {
  if (Object.is(left, right)) return true;
  if (!left || !right) return false;

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        valuesEqual(left[key], right[key])
    )
  );
};

export const reconcileCollectionById = (current = [], incoming = []) => {
  if (!Array.isArray(incoming)) return current;

  const currentById = new Map(
    current.map((item) => [String(item?.id), item])
  );
  const reconciled = incoming.map((item) => {
    const existing = currentById.get(String(item?.id));
    return existing && recordsEqual(existing, item) ? existing : item;
  });
  const unchanged =
    current.length === reconciled.length &&
    current.every((item, index) => item === reconciled[index]);

  return unchanged ? current : reconciled;
};
