# React Ref Manager

Manage, focus and scroll to `Element`s or React `Component`s (refs) in a standard manner.

## Overview

`react-ref-manager` is a standard way of storing references to elements created by React applications and cuts down on boilerplate code for focusing and scrolling to those refs.

`react-ref-manager` is *not* a replacement for React's ref generation or DOM management, nor is it a replacement for the normal focus management provided by the browser.

React renders to the DOM and generates refs, which `react-ref-manager` stores and provides a high-level API for focusing and scrolling, which wrap the browser's API.

## Basic Usage

```javascript
import RefManager, { FocusDirection } from 'react-ref-manager';

class MyComponent extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleKeyPress = this.handleKeyPress.bind(this);

        /**
          * Create a new Ref Manager instance
          */

        this.refManager = new RefManager();
      }

    render() {
        const { items } = this.props;

        return (
          <div onKeyPress={ this.handleKeyPress }>

                /**
                  * Assign refs to important document elements
                  */

                <div ref={ (c) => this.refManager.set('toolbar', c) } tabIndex={-1} />

                {
                    items.map( ({ name }, index) => {
                        return(

                            /**
                              * Assign refs to iterable document elements
                              */

                            <div ref={ (c) => this.refManager.set('items', index, c) tabIndex={-1}>
                                { name }
                            </div>
                        )
                    }
                }

                <div ref={ (c) => this.refManager.set('footer') } tabIndex={-1} />
          </div>
        );
      }

    handleKeyPress({ key }) {
        const refManager = this.refManager;

        if (key = 't') {

            /**
              * Focus elements in the DOM
              */

            refManager.focusById('toolbar');

        } else if (key = 'b') {

            /**
              * Scroll to elements
              */

            refManager.scrollToById('toolbar');

        } else if (parseInt(key) {

            /**
              * Jump to the start of iterable collections, and continue to move
              * through them by repeated key presses
              */

            refManager.focusNextById('items', { direction: FocusDirection.DOWN });

        } else if (key = 'ArrowDown') {

            /**
              * Iterate through collections
              */

            refManager.focusNextById('items', { direction: FocusDirection.DOWN });

        } else if (key = 'ArrowUp') {
            refManager.focusNextById('items', { direction: FocusDirection.UP } );
        }
    }
}

```

## Installation

```bash
npm install react-ref-manager --save
```

## API

#### set()

Stores a ref for later use.

This method should generally be called in React's `render` method, using React `Component`'s `ref` attribute.

You can pass either a single id, or an optional second item id for collections, followed by the ref to store:

```javascript
// Using a single id
this.refManager.set('toolbar', ref)

// Using a collection and item id
this.refManager.set('items', index, ref)
```

`react-ref-manager` does not support any deeper referencing than a collection and item id. If you have elements that resemble a grid, store them as a flat list and use `focusNext`'s options to correctly move focus between them.

#### get()

Retrieves a ref previously stored using `set()`.

You can pass either a single id, or an optional second item id for collections:

```javascript
// Using a single id
this.refManager.get('toolbar')

// Using a collection and item id
this.refManager.get('items', index)
```

### Focusing a ref

#### FocusDirection

A class of constants exported from `react-ref-manager` used to denote directions to iterate through collections. Available values are:

* `FocusDirection.LEFT`
* `FocusDirection.RIGHT`
* `FocusDirection.DOWN`
* `FocusDirection.UP`

```javascript
import { FocusDirection } from 'react-ref-manager';
```

#### Focus objects

Focus objects are returned by all of the `focus*()` methods. A focus object has the following attributes:

* `ref` - The ref that was last focused. `null` when the ref cannot be found in the `RefManager` instance.
* `DOMRef` - The ref pointing to the actual element in the DOM that was focused. For standard React elements (`<div>`, `<span>`, `<input>` etc), this is the same as `ref`. For custom React components that don't define a focus() method, this is the ref to the backing elements in the DOM. `null` when the ref was not found in the DOM.
* `id` - The `itemId` option passed when a ref was last focused.
* `collectionId` - The `collectionId` option passed when a ref was last focused.
* `context` - The value of `context` at the time the ref was last focused. You can store any information about when the ref was focused that you later want to access, in here.
* `applied` - Boolean that is `true` if the focus attempt was successful. If `false`, see the `ref` and `DOMRef` values to determine whether the failure was because the ref could not be found in the `RefManager` instance, or in the DOM.

### Storing and retrieving refs

#### focus()

Focuses a ref passed as the first argument. Accepts a hash of options as the second argument.

Supported options are:

* `id`: The string item `id` of the ref to be focused. This will appear in the focus object returned by this method and `getCurrentFocus()`.
* `collectionId`: (Optional) The string `collectionId` of the ref to be focused, when it is an item in a collection of refs.
* `context`: (Optional) Any contextual information that you want to record about the ref being focused, that will be useful later.

Returns a focus object.

```javascript
const toolbarRef = refManager.get('toolbar');
refManager.focus(toolbarRef, { id: 'toolbar' });
```

#### focusById()

Focuses a ref in the browser identified by an `id` and (optionally) `collectionId`, and updates the currently focused ref in the `RefManager` instance it's called on.

An hash of options can be passed as the final argument, but is not required.

`focusById()` supports all options available in `focus()`, but `id` and `collectionId` are automatically set for you.

Returns a focus object.

```javascript
// Using a single id
refManager.focusById('toolbar');

// Using a collection and item id
refManager.focusById('items', index);

// Using options
refManager.focusById('items', { context: { firstFocus: true } });
refManager.focusById('items', index, { context: { firstFocus: true } });
```

#### focusNext()

Focuses the next item in a collection of refs passed as the first argument. Accepts an options hash as the second argument.

If no item in a collection of refs is currently focused, the first item is focused. If the last item in the collection is already focused, the behaviour depends on the `yWrap` and `xWrap` options.

Accepted options:

* `direction`: (Default: `FocusDirection.RIGHT`) One of the `FocusDirection` values that determines in what direction the collection should be iterated over.
* `indexes`: An array of the collection keys that should be used to iterate over the collection items. The default value is the full set of keys in the collection pointed to by the provided `collectionId`, in the order that those items were added to the collection.
* `context`: Any contextual information that you want to record about the ref being focused.
* `collectionWidth`: (Default: 1) number of items in each row of the collection. Used for iterating over 2 dimensional lists (grids of items).
* `yWrap`: (Default: `false`) whether to allow wrapping of the focused item when the iteration reaches the top or bottom of the collection. i.e. If the `yWrap` is `false` and the user iterates to the bottom of a grid and presses down once more, the focus will not move. If `yWrap` is `true`, the same situation will focus the item in the top row, in that same column.
* `xWrap`: (Default: `false`) whether to allow wrapping of the focused item when the iteration reaches the start or end of a row in the collection. i.e. If the `xWrap` is `false` and the user iterates to the right of a grid and presses right once more, the focus will not move. If `xWrap` is `true`, the same situation will focus the first item in the same row.

Returns a focus object.

```javascript
const usersRef = this.refManager.get('users');

this.refManager.focusNext(usersRef, {
    direction: FocusDirection.RIGHT,
    xWrap: true
});
```

#### focusNextById()

Focuses the next ref in a collection pointed to by the provided `collectionId`. Accepts a hash of options as the second argument.

`focusNextById()` accepts all the options that `focusNext()` does, except `collectionId` is automatically set for you.

Returns a focus object.

```javascript
this.refManager.focusNextById('users', {
    direction: FocusDirection.RIGHT,
    xWrap: true
});
```

### Working with the current focus

#### isFocusedRefInDOM()

Returns whether the ref currently considered focused by `react-ref-manager` is mounted in the DOM and the equal to `document.activeElement`.

#### RefManager.refIsFocused()

This is a class method.

Returns whether the ref passed as its only argument is currently in the DOM and is equal to`document.activeElement`.

The ref does not have to have been focused using an instance of `RefManager`.

#### getCurrentFocus()

Returns the current focus object. The focus object is updated every time one of the `focus*` methods is used. The focus object is an empty object (`{}`) before any `focus*` methods are called.

#### setCurrentFocus()

Sets the current focus object *without* actually focusing the ref in the DOM. Useful if you need to focus a ref externally for whatever reason and need to update `react-ref-manager`.

This method still calls any change listeners that may have been added using `addFocusChangeListener()`.


#### RefManager.focus()

This is a class method.

Focuses the ref passed as it first argument. This method does *not* update any `RefManager` instance's focus object.

Returns the ref pointing to the actual element in the DOM that was focused. For standard React elements (`<div>`, `<span>`, `<input>` etc), this is the same as the `ref` passed as the first argument. For custom React components thad don't define a focus() method, this is the ref to the backing elements in the DOM. Alternatively, it returns `null` when the `ref` was `undefined` or was not found in the DOM.

### Listening to changes in focus

#### addFocusChangeListener()

Accepts a function that is called every time the current focus is changed through the  `RefManager` instance it is called on. The function is called with the previous focus object and the current focus object as its first and second arguments.

`addFocusChangeListener()` returns the function it is passed, so that it may be easily unbound, later on.

```javascript
componentDidMount(){
    this.focusListener = this.refManager.addFocusChangeListener((prevFocus, nextFocus) => {
        if (nextFocus.context === 'users') {
              this.setState({
                    focusedUserId: nextFocus.id
              });
        } else {
              this.setState({
                    focusedUserId: null
              });
        }
    });
}
```

#### removeFocusChangeListener()

Removes a focus change listener that has been previously registered with `addFocusChangeListener()`. It accepts the listener to remove as the first argument.

```javascript
componentWillUnmount(){
    this.refManager.removeFocusChangeListener(this.focusListener);
}
```

### Scrolling

#### Scroll objects

Scroll objects are returned by all of the `scroll*()` methods. A scroll object has the following attributes:

* `ref` - The ref that was scrolled to or `null` when the ref cannot be found in the `RefManager` instance.
* `DOMRef` - The ref pointing to the actual element in the DOM that was scrolled to. For standard React elements (`<div>`, `<span>`, `<input>` etc), this is the same as `ref`. For custom React components that don't define a focus() method, this is the ref to the backing elements in the DOM. `null` is returned instead when the ref was not found in the DOM.
* `id` - The `id` of the ref that was scrolled to.
* `collectionId` - The `collectionId` value passed as an argument when scrolling to the ref.
* `applied` - Boolean that is true if the scroll attempt was successful. If `false`, see the `ref` and `DOMRef` values to determine whether the failure was because the ref could not be found in the `RefManager` instance, or in the DOM.

#### RefManager.scrollTo()

This is a class method.

Scrolls to the ref passed to it as its first argument.

It accepts an options hash as the second argument that is passed straight to [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView).

Returns the ref that was scrolled to (which may be different to the ref passed as an argument in the case of custom React elements that don't define a scrollIntoView() method), or `null` if the ref could not be located in the DOM.

#### scrollToById()

Scrolls to a ref by the `id` and (optionally) `collectionId` that was used when it was registered using `set()`.

An options hash may be passed as the final argument. These options are passed straight to [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView).

When the ref is a custom React component that doesn't define a scrollIntoView() method, it's backing DOM element ref will be located, and that will be used to scroll to.

Returns a scroll object.

```javascript
refManager.scrollToById('toolbar');
```

#### scrollToFocused()

Scrolls to the ref that was last focused, if there is one.

It accepts an options hash as its only argument that is passed straight to [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView).

Returns a scroll object.

## Contributions

All contributions are welcome and encouraged.
