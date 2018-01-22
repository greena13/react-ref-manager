/**
 * @typedef {Object} ReactComponent
 */

import ReactDOM from 'react-dom';
import NotProvided from './utils/NotProvided';
import FocusDirection from './FocusDirection';

class RefManager {
  static refIsFocused(ref) {
    return ref && ref === document.activeElement && ref.parentNode;
  }

  static scrollTo(ref) {
    if (ref) {
      if (ref.scrollIntoView) {
        ref.scrollIntoView();
      } else {
        ReactDOM.findDOMNode(ref).scrollIntoView(false);
      }
    }
  }

  constructor() {
    this._refs = {};
    this._focused = {};
    this._focusListeners = [];
  }

  /**
   * Refs
   */

  set(collectionId, itemIdOrRef = NotProvided, ref = NotProvided) {
    if (ref === NotProvided) {
      this._refs[collectionId] = itemIdOrRef;
    } else {
      const collectionRef = this._refs[collectionId];

      if (!collectionRef) {
        this._refs[collectionId] = {};
      }

      this._refs[collectionId][itemIdOrRef] = ref;
    }
  }

  get(collectionId = NotProvided, itemId = NotProvided) {
    return this._refs && itemId === NotProvided ? this._refs[collectionId] : this._refs[collectionId] && this._refs[collectionId][itemId];
  }

  /**
   * Focus
   */

  setCurrentFocus(focused) {
    const previousFocus = this._focused;
    this._focused = focused;

    this._focusListeners.forEach((listener) => {
      listener(previousFocus, focused);
    });

    return this._focused;
  }

  getCurrentFocus() {
    return this._focused || {};
  }

  isFocusedRefInDOM() {
    return this.constructor.refIsFocused(this.getCurrentFocus().ref);
  }

  focusById(collectionId, itemIdOrOptions = NotProvided, options = NotProvided) {

    if (options === NotProvided) {
      const [ _itemId, _options ] = function() {

        if (itemIdOrOptions === NotProvided) {
          return [ undefined, {}];
        } else {
          if (typeof(itemIdOrOptions) === 'object') {
            return [ undefined, itemIdOrOptions || {} ];
          } else {
            return [ itemIdOrOptions, {} ];
          }
        }
      }();

      if (_itemId) {
        this.focus(this.get(collectionId, _itemId), {
          id: _itemId,
          context: _options.context || collectionId,
          ..._options
        });

      } else {
        this.focus(this.get(collectionId), {
          context: _options.context || collectionId,
          ..._options
        });
      }

    } else {
      this.focus(this.get(collectionId, itemIdOrOptions), {
        ...options,
        id: itemIdOrOptions,
        context: options.context || collectionId,
      });
    }
  }

  focus(ref, options) {
    if (ref) {
      if (ref.focus) {
        ref.focus();
      } else {
        ReactDOM.findDOMNode(ref).focus();
      }

      if (options.DOMOnly !== true) {
        return this.setCurrentFocus({
          ref,
          id: options.id,
          context: options.context,
        });
      }
    }
  }

  focusNextById(collectionId, options = {}) {
    const refCollection = this.get(collectionId);

    return this.focusNext(refCollection, {
      context: collectionId,
      ...options
    });
  }

  focusNext(refCollection, { direction = FocusDirection.RIGHT, indexes, context, collectionWidth = 1, yWrap = false, xWrap = false }) {
    const { id } = this.getCurrentFocus();

    const indexesToUse = indexes ? indexes : Object.keys(refCollection);
    const refIdsIndex = indexesToUse.indexOf(id);

    if (refIdsIndex === -1) {

      const firstRefId = indexesToUse[0];

      this.focus(refCollection[firstRefId], { id: firstRefId, context });

      return this.getCurrentFocus();
    } else {

      const nextRefId = function(){
        if (direction === FocusDirection.LEFT) {
          const nextRefIndex = refIdsIndex - 1;

          if (nextRefIndex >= 0) {
            return indexesToUse[refIdsIndex - 1];
          } else {
            if (xWrap) {
              return indexesToUse[indexesToUse.length - 1];
            } else {
              return indexesToUse[0];
            }
          }

        } else if (direction === FocusDirection.RIGHT) {

          const nextRefIndex = refIdsIndex + 1;

          if (nextRefIndex < indexesToUse.length) {
            return indexesToUse[refIdsIndex + 1];
          } else {
            if (xWrap) {
              return indexesToUse[0];
            } else {
              return indexesToUse[indexesToUse.length - 1];
            }
          }

        } else if (direction === FocusDirection.UP) {
          const nextRefIndex = refIdsIndex - collectionWidth;

          if (nextRefIndex >= 0) {
            return indexesToUse[refIdsIndex - collectionWidth];
          } else {
            if (yWrap) {
              return indexesToUse[indexesToUse.length - 1];
            } else {
              return indexesToUse[0];
            }
          }

        } else if (direction === FocusDirection.DOWN) {

          const nextRefIndex = refIdsIndex + collectionWidth;

          if (nextRefIndex < indexesToUse.length) {
            return indexesToUse[refIdsIndex + collectionWidth];
          } else {
            if (yWrap) {
              return indexesToUse[0];
            } else {
              return indexesToUse[indexesToUse.length - collectionWidth];
            }
          }
        }
      }();

      const nextRef = refCollection[nextRefId];

      if (nextRef) {
        this.focus(nextRef, { id: nextRefId, context });

        return this.getCurrentFocus();
      }
    }
  }

  scrollToById(collectionId, itemId = NotProvided) {
    const ref = this.get(collectionId, itemId);
    this.constructor.scrollTo(this.getCurrentFocus().ref);
  }

  scrollToFocused() {
    this.constructor.scrollTo(this.getCurrentFocus().ref);
  }

  /**
   * Focus listeners
   */

  addFocusChangeListener(listener) {
    this._focusListeners.push(listener);
    return listener;
  }

  removeFocusChangeListener(listener) {
    const listenerIndex = this._focusListeners.indexOf(listener);

    if (listenerIndex !== -1) {
      this._focusListeners = [
        ...this._focusListeners.splice(0, listenerIndex),
        ...this._focusListeners.splice(listenerIndex + 1)
      ];
    }
  }
}

export default RefManager;
