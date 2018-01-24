import ReactDOM from 'react-dom';
import NotProvided from './utils/NotProvided';
import FocusDirection from './FocusDirection';

/**
 * @typedef {Object} ReactClassComponent
 */

/**
 * @typedef {Object} FocusObject Contains the current focus status and context
 * @property {ReactClassComponent|null} ref The ref that was last focused or null when
 *          the ref cannot be found in the RefManager instance.
 * @property {ReactClassComponent|null} DOMRef The ref pointing to the actual element
 *          in the DOM that was focused. For standard React elements (<div>, <span>,
 *          <input> etc), this is the same as ref. For custom React components that
 *          don't define a focus() method, this is the ref to the backing elements
 *          in the DOM. Or null when the ref was not found in the DOM.
 * @property {String|Number} id The value of the id option passed when a ref was
 *          last focused.
 * @property {String|Number} collectionId The collectionId option passed when a ref
 *          was last focused.
 * @property {*} context The value of context at the time the ref was last focused.
 *          You can store any information about when the ref was focused that you
 *          later want to access, in here.
 * @property {Boolean} applied True if the focus attempt was successful. If false,
 *          see the ref and DOMRef values to determine whether the failure was
 *          because the ref could not be found in the RefManager instance, or in the DOM.
 */

/**
 * @typedef {Object} ScrollObject Contains the current scroll status
 * @property {ReactClassComponent|null} ref The ref that was last scrolled to or null
 *          when the ref cannot be found in the RefManager instance.
 * @property {ReactClassComponent|null} DOMRef The ref pointing to the actual element
 *          in the DOM that was scrolled to. For standard React elements (<div>, <span>,
 *          <input> etc), this is the same as ref. For custom React components that don't
 *          define a scrollIntoView() method, this is the ref to the backing elements
 *          in the DOM. Or null when the ref was not found in the DOM.
 * @property {String|Number} id The value of the id option passed when a ref was
 *          last scrolled.
 * @property {String|Number} collectionId The collectionId option passed when a ref
 *          was last scrolled.
 * @property {Boolean} applied True if the scroll attempt was successful. If false,
 *          see the ref and DOMRef values to determine whether the failure was
 *          because the ref could not be found in the RefManager instance, or in the DOM.
 */

/**
 * @class RefManager class that contains functionality for storing, focusing and
 * scrolling to refs generated by React components
 */

class RefManager {
  /**
   * Returns whether a ref is mounted in the DOM and the element that is currently
   * focused
   * @param {ReactClassComponent} ref Ref that points to the element that should be
   *        tested to see whether it's mounted in the DOM and focused.
   * @returns {boolean} Whether the ref points to an element that is currently focused
   */
  static refIsFocused(ref) {
    return ref && ref === document.activeElement && !!ref.parentNode;
  }

  /**
   * Focuses a ref in the DOM if it is mounted. This method does NOT update any
   * RefManager instance's focus object.
   *
   * @param {ReactClassComponent} ref Ref to focus
   * @returns {ReactClassComponent|null} The ref pointing to the actual element in
   *          the DOM that was focused. For standard React elements (<div>, <span>,
   *          <input> etc), this is the same as the ref passed as the first argument.
   *          For custom React components that don't define a focus() method, this is
   *          the ref to the backing elements in the DOM. Alternatively, it returns
   *          null when the ref was undefined or was not found in the DOM.
   */
  static focus(ref) {
    if (ref) {
      if (ref.focus) {
        ref.focus();

        return ref;
      } else {
        const DOMRef = ReactDOM.findDOMNode(ref);

        if (DOMRef && !!DOMRef.parentNode) {
          DOMRef.focus();

          return DOMRef;
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }

  /**
   * Scrolls to a ref in the browser if it can be found in the DOM.
   *
   * @param {ReactClassComponent} ref Ref to scroll to
   * @param {Object|boolean} options Options passed straight to scrollIntoView.
   * @returns {ReactClassComponent|null} Ref that was scrolled to (which may be
   *          different to the ref passed as an argument in the case of custom
   *          React elements), or null if the ref could not be located in the DOM.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
   */
  static scrollTo(ref, options = NotProvided) {
    if (ref) {
      if (ref.scrollIntoView) {
        ref.scrollIntoView();

        return ref;
      } else {
        const domRef = ReactDOM.findDOMNode(ref);

        if (domRef && !!domRef.parentNode) {
          domRef.scrollIntoView(options === NotProvided ? false : options);
          return domRef;
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }

  /**
   * Creates a new RefManager instance
   */
  constructor() {
    this._refs = {};
    this._focused = {};
    this._focusListeners = [];
  }

  /**
   * Stores a ref for later use. This method should generally be called
   * in React's render method, using React Component's ref attribute.
   *
   * @param {String|Number} collectionId Id of the collection to store the ref in, if
   *        it is an element in a larger collection of refs. If ref is a singular item
   *        then this value is the single key used to store the ref for later retrieval.
   * @param {String|Number|Object=undefined} itemIdOrRef Item id to store the ref under
   *        when the ref is an item in a larger collection. If the ref is a singular
   *        item, then this value is not used and the next argument occupies this space.
   * @param {ReactClassComponent} ref Ref to store
   *
   * @example Using a single id
   * this.refManager.set('toolbar', ref)
   *
   * @example Using a collection and item id
   * this.refManager.set('items', index, ref)
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

  /**
   * Retrieves a ref previously stored using set()
   *
   * @param {String|Number} collectionId Id of the collection to retrieve the ref from.
   *        If the ref is not part of a collection, this is the singular id that was
   *        used to store the ref.
   * @param {String|Number} itemId Id of the item to use to retrieve the ref. If the
   *        ref is not part of a collection, this value is not used.
   * @returns {ReactClassComponent|undefined} Ref that was stored earlier using the
   *        collection and optionally item id.
   *
   * @example Using a single id
   * this.refManager.get('toolbar')
   *
   * @example Using a collection and item id
   * this.refManager.get('items', index)
   */
  get(collectionId = NotProvided, itemId = NotProvided) {
    return this._refs && itemId === NotProvided ? this._refs[collectionId] : this._refs[collectionId] && this._refs[collectionId][itemId];
  }

  /**
   * Sets the current focus object without actually focusing the ref in the DOM.
   * Useful if you need to focus a ref externally for whatever reason and need to
   * update a RefManager instance.
   *
   * This method still calls any change listeners that may have been added using
   * addFocusChangeListener()
   *
   * @param {FocusObject} focused The focus object to set as the new current one
   * @returns {FocusObject} the new focus object
   */
  setCurrentFocus(focused) {
    const previousFocus = this._focused;
    this._focused = focused;

    this._focusListeners.forEach((listener) => {
      listener(previousFocus, focused);
    });

    return this._focused;
  }

  /**
   * Returns the current focus object. The focus object is updated every time one
   * of the focus* methods is used, or setCurrentFocus().
   *
   * The focus object is an empty object ({}) before any focus* methods are called.
   * @returns {{}|FocusObject} The current focus object, or an empty object.
   */
  getCurrentFocus() {
    return this._focused || {};
  }

  /**
   * Returns whether the ref currently considered focused by the RefManager instance
   * is mounted in the DOM and the equal to document.activeElement.
   *
   * @returns {boolean} Whether the ref that was last focused by the RefManager
   *          instance is currently mounted and focused in the DOM
   */
  isFocusedRefInDOM() {
    return this.constructor.refIsFocused(this.getCurrentFocus().DOMRef);
  }

  /**
   * Focuses a ref in the DOM and records it as currently focused in the RefManager
   * instance.
   *
   * @param {ReactClassComponent} ref The ref to focus
   * @param {Object.<String,*>} options An options hash to configure how the ref is
   *        stored once it is focused.
   * @param {String|Number} options.id The item id of the ref to be focused.
   *        This will appear in the focus object returned by this method and
   *        getCurrentFocus().
   * @param {String|Number=undefined} options.collectionId The collectionId of the
   *        ref to be focused, when it is an item in a collection of refs.
   * @param {*} options.context Any contextual information that you want to record
   *        about the ref being focused, that will be useful later.
   * @returns {FocusObject} Current focus object, after the ref has been focused in
   *        the DOM and stored according the the options provided.
   *
   * @example Focusing a toolbar ref
   * const toolbarRef = refManager.get('toolbar');
   * refManager.focus(toolbarRef, { id: 'toolbar' });
   */
  focus(ref, { id, collectionId, context }) {

    if (ref) {
      const DOMRef = this.constructor.focus(ref);

      return this.setCurrentFocus({
        ref,
        DOMRef,
        id, collectionId, context, applied: !!DOMRef
      });
    } else {
      return {
        ref: null,
        DOMRef: null,
        id, collectionId, context,
        applied: false
      }
    }
  }

  /**
   * Focuses a ref in the browser identified by an id and (optionally) a collectionId,
   * and updates the currently focused ref in the RefManager instance.
   *
   * @param {String|Number} collectionId The collectionId of the
   *        ref to be focused, when it is an item in a collection of refs.
   * @param {String|Number|Object.<String,*>} itemIdOrOptions The item id of the ref
   *        to be focused. This will appear in the focus object returned by this
   *        method and getCurrentFocus(). If an item id is not required, this is
   *        the options hash, accepted as the last parameter.
   * @param {Object.<String,*>} options An options hash to configure how the ref is
   *        stored once it is focused.
   * @param {*} options.context Any contextual information that you want to record
   *        about the ref being focused, that will be useful later.
   * @returns {FocusObject} Current focus object, after the ref has been focused in
   *        the DOM and stored according the the options provided.
   *
   * @example Using a single id
   * refManager.focusById('toolbar');
   *
   * @example Using a collection and item id
   * refManager.focusById('items', index);
   *
   * @example Using options
   * refManager.focusById('items', { context: { firstFocus: true } });
   * refManager.focusById('items', index, { context: { firstFocus: true } });
   */
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

      console.warn('_itemId, _options:');
      console.warn(_itemId, _options);

      if (_itemId) {
        return this.focus(this.get(collectionId, _itemId), {
          id: _itemId,
          collectionId,
          ..._options
        });

      } else {
        return this.focus(this.get(collectionId), {
          collectionId,
          ..._options
        });
      }

    } else {
      return this.focus(this.get(collectionId, itemIdOrOptions), {
        ...options,
        id: itemIdOrOptions,
        collectionId,
      });
    }
  }

  /**
   * Focuses the next ref in a collection pointed to by the provided collectionId.
   *
   * @param {String|Number} collectionId The collectionId of the ref to be focused,
   *        when it is an item in a collection of refs.
   * @param {Object.<String,*>} options Options hash to configure how the ref is focused.
   * @param {FocusDirection=FocusDirection.RIGHT} options.direction One of the
   *        FocusDirection values that determines in what direction the collection should
   *        be iterated over.
   * @param {Array.<String|Number>} options.indexes An array of the collection keys
   *        that should be used to iterate over the collection items. The default value
   *        is the full set of keys in the collection pointed to by the provided
   *        collectionId, in the order that those items were added to the collection.
   * @param {*} options.context Any contextual information that you want to record
   *        about the ref being focused.
   * @param {Number=1} options.collectionWidth number of items in each row of the
   *        collection. Used for iterating over 2 dimensional lists (grids of items).
   * @param {Boolean=false} options.yWrap whether to allow wrapping of the focused item
   *        when the iteration reaches the top or bottom of the collection. i.e. If the
   *        yWrap is false and the user iterates to the bottom of a grid and presses
   *        down once more, the focus will not move. If yWrap is true, the same
   *        situation will focus the item in the top row, in that same column.
   * @param {Boolean=false} options.xWrap Similar to yWrap, but for wrapping around
   *        rows, rather than columns.
   * @returns {FocusObject} The current focus object, once the next item in a collection
   *        has been focused in the DOM and stored in the RefManager instance.
   *
   * @example
   * this.refManager.focusNextById('users', {
   *     direction: FocusDirection.RIGHT,
   *     xWrap: true
   * });
   */
  focusNextById(collectionId, options = {}) {
    const refCollection = this.get(collectionId);

    return this.focusNext(refCollection, {
      ...options,
      collectionId: collectionId,
    });
  }

  /**
   * Focuses the next item in a collection of refs. If no item in a collection of refs
   * is currently focused, the first item is focused. If the last item in the
   * collection is already focused, the behaviour depends on the options.yWrap and
   * options.xWrap
   *
   * @param {Object.<String|Number,ReactClassComponent>} refCollection The collection
   *        of refs to iterate over.
   * @param {Object.<String,*>} options Options hash to configure how the ref is focused.
   * @param {FocusDirection=FocusDirection.RIGHT} options.direction One of the
   *        FocusDirection values that determines in what direction the collection should
   *        be iterated over.
   * @param {Array.<String|Number>} options.indexes An array of the collection keys
   *        that should be used to iterate over the collection items. The default value
   *        is the full set of keys in the collection pointed to by the provided
   *        collectionId, in the order that those items were added to the collection.
   * @param {String|Number} options.collectionId The collectionId of the ref to be focused,
   *        when it is an item in a collection of refs.
   * @param {*} options.context Any contextual information that you want to record
   *        about the ref being focused.
   * @param {Number=1} options.collectionWidth number of items in each row of the
   *        collection. Used for iterating over 2 dimensional lists (grids of items).
   * @param {Boolean=false} options.yWrap whether to allow wrapping of the focused item
   *        when the iteration reaches the top or bottom of the collection. i.e. If the
   *        yWrap is false and the user iterates to the bottom of a grid and presses
   *        down once more, the focus will not move. If yWrap is true, the same
   *        situation will focus the item in the top row, in that same column.
   * @param {Boolean=false} options.xWrap Similar to yWrap, but for wrapping around
   *        rows, rather than columns.
   * @returns {FocusObject} The current focus object, once the next item in a collection
   *        has been focused in the DOM and stored in the RefManager instance.
   */
  focusNext(refCollection, { direction = FocusDirection.RIGHT, indexes, collectionId, context, collectionWidth = 1, yWrap = false, xWrap = false }) {

    if (!refCollection) {
      return {
        ref: null,
        DOMRef: null,
        collectionId,
        context,
        applied: false
      };
    }

    const currentFocus = this.getCurrentFocus();

    const indexesToUse = indexes ? indexes : Object.keys(refCollection);
    const refIdsIndex = indexesToUse.indexOf(currentFocus.id);

    if (currentFocus.collectionId !== collectionId || refIdsIndex === -1) {
      const firstRefId = indexesToUse[0];

      return this.focus(refCollection[firstRefId], { id: firstRefId, collectionId, context });
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

      return this.focus(nextRef, { id: nextRefId, collectionId, context });
    }
  }

  /**
   * Scrolls to a ref by an id and (optionally) collectionId that was used when
   * it was registered using set().
   *
   * When the ref is a custom React component that doesn't define a scrollIntoView method,
   * it's backing DOM element ref will be located, and that will be used to scroll to.
   *
   * @param {String|Number} collectionId The collectionId of the ref to be scrolled to,
   *        when it is an item in a collection of refs.
   * @param {String|Number|Object|Boolean} itemIdOrOptions The item id of a ref to
   *        scroll to, if it is in a collection. If not, this is the options parameter
   *        that is passed straight to scrollIntoView.
   * @param {Object|boolean} options Options passed straight to scrollIntoView.
   * @returns {ScrollObject} Status of the scroll event
   *
   * @example
   * refManager.scrollToById('toolbar');
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
   */
  scrollToById(collectionId, itemIdOrOptions = NotProvided, options = NotProvided) {
    const [_itemId, _options] = function(){
      if (options === NotProvided) {
        if (itemIdOrOptions === NotProvided) {
          return [NotProvided, NotProvided];
        } else if (typeof itemIdOrOptions === 'string') {
          return [ itemIdOrOptions, NotProvided];
        } else {
          return [ NotProvided, itemIdOrOptions ]
        }
      } else {
        return [ itemIdOrOptions, options ];
      }
    }();

    const ref = this.get(collectionId, _itemId);

    if (ref) {
      const scrolledToRef = this.constructor.scrollTo(ref.DOMRef, _options);

      return {
        id: _itemId, collectionId,
        ref,
        DOMRef: scrolledToRef,
        applied: !!scrolledToRef
      };

    } else {
      return {
        id: _itemId, collectionId,
        ref: null,
        DOMRef: null,
        applied: false
      };
    }
  }

  /**
   * Scrolls to the ref that was last focused, if there is one.
   *
   * @param {Object|boolean} options Options passed straight to scrollIntoView.
   * @returns {ScrollObject} Status of the scroll event
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
   */
  scrollToFocused(options = NotProvided) {
    let currentFocusRef = this.getCurrentFocus();

    if (currentFocusRef) {
      const scrolledToRef = this.constructor.scrollTo(currentFocusRef.DOMRef, options);

      return {
        id: currentFocusRef.id,
        collectionId: currentFocusRef.collectionId,
        ref: currentFocusRef.ref,
        DOMRef: scrolledToRef,
        applied: !!scrolledToRef
      };
    } else {
      return {
        id: currentFocusRef.id,
        collectionId: currentFocusRef.collectionId,
        ref: null,
        DOMRef: null,
        applied: false
      };
    }
  }

  /**
   * Adds a listener function to be called every time the current focus is changed
   * through the RefManager instance.
   *
   * The function is called with the previous focus object and the current
   * focus object as its first and second arguments.
   *
   * @param {Function} listener A listener function to be called every time the
   *        RefManager changes the focus.
   * @returns {Function} The listener function passed as the first argument.
   */
  addFocusChangeListener(listener) {
    this._focusListeners.push(listener);
    return listener;
  }

  /**
   * Removes a focus change listener that has been previously registered
   * with addFocusChangeListener().
   *
   * @param {Function} listener The listener function to remove.
   */
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
