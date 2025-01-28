import { bezier } from "./bezier";

export class Easing {
    static linear(t: number) {
        return t;
    }

    static bezier(x1: number, y1: number, x2: number, y2: number) {
        return (t: number) => {
            return bezier(x1, y1, x2, y2)(t);
        }
    }

    static ease(t: number) {
        return Easing.bezier(0.42, 0, 1, 1)(t);
    }

    static inOut(easing: (t: number) => number) {
        return (t: number) => {
            if (t < 0.5) return easing(t * 2) / 2;
            return 1 - easing((1 - t) * 2) / 2;
        }
    }
    
    static in(easing: (t: number) => number) {
        return (t: number) => {
            return easing(t);
        }
    }

    static out(easing: (t: number) => number) {
        return (t: number) => {
            return 1 - easing(1 - t);
        }
    }
}
