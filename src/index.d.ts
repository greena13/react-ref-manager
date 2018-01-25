// Type definitions for RefManager
// Project: react-ref-manager

import * as React from 'react';

interface FocusObject {
    ref: React.Component | null,
    DOMRef: React.Component | null,
    id?: string | number,
    collectionId: string | number,
    context: any,
    applied: boolean
}

interface ScrollObject {
    ref: React.Component | null,
    DOMRef: React.Component | null,
    id?: string | number,
    collectionId: string | number,
    applied: boolean
}

module RefManager {
    export enum FocusDirection {
        LEFT = 'LEFT',
        RIGHT = 'RIGHT',
        UP = 'UP',
        DOWN = 'DOWN'
    }

    export class RefManager {
        constructor();

        static refIsFocused(ref: React.Component): boolean;

        static focus(ref: React.Component): React.Component | null;

        static scrollTo(ref: React.Component, options?: {} | boolean): React.Component | null;

        set(collectionId: string | number, itemIdOrRef: string | number | React.Component, ref?: React.Component);

        get(collectionId: string | number, itemId?: string | number): React.Component;

        setCurrentFocus(FocusObject): FocusObject;

        getCurrentFocus(): FocusObject;

        isFocusedRefInDOM(): boolean;

        focus(ref: React.Component, options: { id?: string | number, collectionId: string | number, context?: any }): FocusObject;

        focusById(collectionId: string | number , itemIdOrOptions: string | number | { context?: any }, options?: { context?: any }): FocusObject;

        focusNextById(collectionId: string | number , options?: { direction?: FocusDirection, indexes?: Array<string | number>, collectionWidth?: number, yWrap?: boolean, xWrap?: boolean , context?: any }): FocusObject;

        focusNext(collectionId: { [key: string]: React.Component }, options?: { direction?: FocusDirection, indexes?: Array<string | number>, collectionWidth?: number, yWrap?: boolean, xWrap?: boolean, context?: any }): FocusObject;

        scrollById(collectionId: string | number , itemIdOrOptions: any, options?: any): ScrollObject;

        scrollToFocused(options?: any): ScrollObject;

        addFocusChangeListener(listener: Function): Function

        removeFocusChangeListener(listener: Function)
    }
}
