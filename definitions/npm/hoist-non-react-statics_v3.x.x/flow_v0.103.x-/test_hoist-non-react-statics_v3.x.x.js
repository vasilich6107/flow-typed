// @flow

/**
 * Adapted from DefinitelyTyped/types/hoist-non-react-statics/hoist-non-react-statics-tests.tsx
 */

import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { it, describe } from 'flow-typed-test';

describe('class components', () => {
    class A extends React.Component<{|
        x: number,
        y?: number | null,
    |}> {
        static a = 'a';
        static c = 'c';

        getA() {
            return A.a;
        }
    }

    class B extends React.Component<{|
        n: number,
    |}> {
        static b = 'b';
        static c = 42;

        static defaultProps = {
            n: 42,
        };

        getB() {
            return B.b;
        }
    }

    // $ExpectError - see † below
    const C = hoistNonReactStatics(A, B);

    it('does not affect a static on target', () => {
        const a1: string = C.a;
        // $ExpectError
        const a2: number = C.a;
    });

    it('hoists non-React statics from source', () => {
        const b1: string = C.b;
        // $ExpectError
        const b2: number = C.b;
    });

    it('overwrites statics of the same name on target', () => {
        const c1: number = C.c;
        // $ExpectError
        const c2: string = C.c;
    })

    it('does not affect non-statics on target', () => {
        const a1: string = C.prototype.getA();
        // $ExpectError
        const a2: number = C.prototype.getA();
    });

    it('does not hoist React statics from source', () => {
        /**
         * † This does throw an error, but the error is somehow thrown at the function call itself. Seems to
         *   be a regression introduced in flow v0.103.0.
         */
        C.defaultProps;
    });

    it('does not hoist non-statics from source', () => {
        // $ExpectError
        C.prototype.getB();
    });

    it('does not affect the props type of target', () => {
        <C x={1} />;
        <C x={1} y={2} />;
        // $ExpectError
        <C x="x" />;
        // $ExpectError
        <C n={42} />;
    });

    // $ExpectError - see † below
    const D = hoistNonReactStatics(A, B, { a: true, b: true, c: true });

    it('does not affect a static on target even when specified as a custom static', () => {
        const a1: string = D.a;
        // $ExpectError
        const a2: number = D.a;
    });

    it('does not hoist a static when specified as a custom static', () => {
        const c1: string = D.c;
        // $ExpectError
        const c2: number = D.c;
        /**
         * † This does throw an error, but the error is somehow thrown at the function call itself. Seems to
         *   be a regression introduced in flow v0.103.0.
         */
        D.b;
    });
});

describe('functional components', () => {
    const A = ({ x, y }: {| x: number, y?: number |}) => <div>{x + (y || 0)}</div>;
    A.a = 'a';
    A.c = 'c';

    const B = ({ n }: {| n: number |}) => <div>{n}</div>;
    B.b = 'b';
    B.c = 42;
    B.defaultProps = {
        n: 42,
    };

    const C = hoistNonReactStatics(A, B);

    /**
     * Nothing really works for functional components, just like how it was with our v2.x.x defs :( Use-cases
     * defined below are to ensure that we at least don't give false positives.
     */
    C.a;
    C.b;
    C.c;
    <C x={1} />;
    <C x={1} y={2} />;
});
