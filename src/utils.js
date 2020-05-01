import { Children, isValidElement } from "react";

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
/**
 * Returns true if the element has children, otherwise returns false.
 * @param {} element The children array from the element where is used.
 */
export const hasChildren = (element) =>
  isValidElement(element) && Boolean(element.props.children);

/**
 *  convert child to string
 *
 */
export const childToString = (child) => {
  if (
    typeof child === "undefined" ||
    child === null ||
    typeof child === "boolean"
  ) {
    return "";
  }
  if (JSON.stringify(child) === "{}") {
    return "";
  }
  return child.toString();
};

/***
 *
 * Strips all html and returns only text nodes
 * @param   {children} children the children array from the element where is used.
 * @returns  A string composed by all text nodes in the provided tree.
 */
export const onlyText = (children) => {
  if (!(children instanceof Array) && !isValidElement(children)) {
    return childToString(children);
  }
  return Children.toArray(children).reduce((text, child) => {
    let newText = "";
    if (isValidElement(child) && hasChildren(child)) {
      newText = onlyText(child.props.children);
    } else {
      newText = childToString(child);
    }
    return text.concat(newText);
  }, "");
};
let Utils;
export default Utils = {
  ...Children,
  onlyText,
  hasChildren,
  childToString,
};
