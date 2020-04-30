/**
 *  Check if object empty
 * @param {Object} obj
 * @return {Boolean}
 */
export const isObjEmpty = (obj) => {
  if (obj == undefined) {
    return true;
  }
  return Object.entries(obj).length === 0 && obj.constructor === Object;
};

/**
 * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
 * length of `0` and objects with no own enumerable properties are considered
 * "empty".
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Array|Object|string} value The value to inspect.
 * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty([]);
 * // => true
 *
 * _.isEmpty({});
 * // => true
 *
 * _.isEmpty('');
 * // => true
 */

export const isEmpty = (value) => {
  if (!value) {
    return true;
  }
  if (value == "null") {
    return true;
  } else if (Array.isArray(value) || typeof value == "string") {
    return !value.length;
  } else if (typeof value == "object") {
    return isObjEmpty(value);
  } else if (value !== null) {
    return false;
  }
  return true;
};
