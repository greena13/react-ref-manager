# React Ref Manager

Manage, focus and scroll to `Element`s or React `Component`s (refs) in a standard manner.

## What React Ref Manager is

* A standard way of storing references to elements created by React applications
* A way to cut down on boilerplate code for storing `ref`s, and focusing and scrolling to DOM elements

## What React Ref Manager is NOT

* A replacement for React's ref generation or DOM management
* A replacement for the normal focus management provided by the browser

## How React Ref Manager connects with React and the browser

React renders to the DOM and generates the `ref`s. `react-ref-manager` stores those `ref`s and provides a high-level API for moving focus between, and scrolling to, those `ref`s.

React handles keyboard events and provides handlers that use `rearct-ref-manager`'s high-level API, that delegate to the browser to execute.

## Basic Usage

```javascript
import { RefManager, FocusDirection } from 'react-ref-manager';

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

            refManager.focusNext('items', { direction: FocusDirection.DOWN });

        } else if (key = 'ArrowDown') {

            /**
              * Iterate through collections
              */

            refManager.focusNext('items', { direction: FocusDirection.DOWN });

        } else if (key = 'ArrowUp') {
            refManager.focusNext('items', { direction: FocusDirection.UP } );
        }
    }
}

```

## Installation

```bash
npm install react-ref-manager --save
```

## API

### Storing and retrieving refs

#### set()

Stores a `ref` for later use.

This method should generally be called in React's `render` method.

You can pass either a single id, or an optional second item id for collections, followed by the ref to store:

```javascript
// Using a single id
this.refManager.set('toolbar', ref)

// Using a collection and item id
this.refManager.set('items', index, ref)
```

`react-ref-manager` does not support any deeper referencing than a collection and item id. If you have elements that resemble a grid, store them as a flat list and use `focusNext`'s options to correctly move focus between them.

#### get()

Retrieves a `ref` previously stored.

You can pass either a single id, or an optional second item id for collections:

```javascript
// Using a single id
this.refManager.get('toolbar')

// Using a collection and item id
this.refManager.get('items', index)
```

### Focus management

#### focus()

Focuses a `ref` passed as the first argument. Accepts a hash of options as the second optional argument.

Supported options are:

* `id`: A string that describes the `id` of the `ref` to be focused. This will appear in the focus object returned by `getCurrentFocus()` and similar methods. It's technically optional, but is highly recommended as it's used for easily retrieving the currently focused ref, later in your code.
* `context`: Any contextual information that you want to record about the ref being focused. If the `ref` is from a collection, it's expected the `collectionId` will be provided, to allow retrieving the ref by `collectionId` and `itemId` at a later date.
* `DOMOnly`: (Default: `false`) When set to `true`, only focuses the `ref` pointed to by the provided id(s) without updating the currently focused `ref` in the `RefManager` instance. Useful for when you need a custom React `Component` to be in focus, but you need a parent `ref` to be focused in the DOM to have your keyboard events captured correctly.

```javascript
const toolbarRef = refManager.get('toolbar');
refManager.focus(toolbarRef);

// Using options

refManager.focus(toolbarRef, { DOMOnly: true });
```

#### focusById()

Focuses a `ref` pointed to by the provided id(s) in the browser and updates the currently focused ref in the `RefManager` instance.

You can pass either a single id, or an optional second item id for collections. An optional hash of options can be passed as the final argument, in either case.

Supports all options available in `focus()`, but `id` and `context` are automatically set for you as the `itemId` and `collectionId`.

```javascript
// Using a single id

refManager.focusById('toolbar');

// Using a collection and item id

refManager.focusById('items', index);

// Using options

refManager.focusById('toolbar', { DOMOnly: true });
refManager.focusById('items', index, { DOMOnly: true });
```

#### focusNext()

Focuses the next item in a collection of refs passed as the first argument. Accepts an options hash as the second argument.

Accepted options:

* `direction`: (Default: `FocusDirection.RIGHT`) One of the `FocusDirection` values that determines in what direction the collection should be iterated over.
* `indexes`: An array of the collection keys that should be used to iterate over the collection items. The default value is the full set of keys in the collection pointed to by the provided `collectionId`, in the order that those items were added to that collection.
* `context`: Any contextual information that you want to record about the ref being focused. If the `ref` is from a collection, it's expected the `collectionId` will be provided, to allow retrieving the ref by `collectionId` and `itemId` (set for you) at a later date.
* `collectionWidth`: (Default: 1) number of items in each row of the collection. Used for iterating over 2 dimensional lists (grids of items).
* `yWrap`: (Default: `false`) whether to allow wrapping of the focused item when the iteration reaches the top or bottom of the collection. i.e. If the `yWrap` is `false` and the user iterates to the bottom of a grid and presses down once more, the focus will not move. If `yWrap` is `true`, the same situation will focus the item in the top row, in that same column.
* `xWrap`: (Default: `false`) whether to allow wrapping of the focused item when the iteration reaches the start or end of a row in the collection. i.e. If the `xWrap` is `false` and the user iterates to the right of a grid and presses right once more, the focus will not move. If `yWrap` is `true`, the same situation will focus the first item in the same row.

#### focusNextById()

Focuses the next `ref` in a collection pointed to by the provided `collectionId`. Accepts a hash of options as the second argument.

Accepted all the options accepted by `focusNext()`, except `context` is automatically set for you.

### FocusDirection

A class of constants exported from `react-ref-manager` used to denote directions to iterate through collections. Available values are:

* `FocusDirection.LEFT`
* `FocusDirection.RIGHT`
* `FocusDirection.DOWN`
* `FocusDirection.UP`
